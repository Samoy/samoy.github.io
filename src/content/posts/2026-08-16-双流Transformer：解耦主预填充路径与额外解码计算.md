---
title: 双流Transformer：解耦主预填充路径与额外解码计算
category: AI
date: 2026-08-16 10:13:11 +08:00
---

在大语言模型（LLM）的实际部署中，工程师们常常面临一个令人头疼的“跷跷板”难题：优化了首字延迟（TTFT, Time To First Token），却牺牲了后续的生成速度（ITL, Inter-Token Latency）；提高了系统的整体吞吐量，却导致长文本请求频繁阻塞。这种性能矛盾的根源，在于传统推理引擎将两个物理特性截然不同的计算阶段“强行绑定”在了同一套计算资源上。

为了打破这一瓶颈，业界提出了一种被称为“双流Transformer”或 Prefill-Decode（PD）分离的架构。该架构通过将主预填充（Prefill）路径与额外解码（Decode）计算彻底解耦，重新定义了 LLM 推理的性能天花板。本文将深入剖析这一技术的底层原理、实践方法以及未来的演进方向。

## 一、 追本溯源：LLM推理的“双重性格”与技术瓶颈

要理解 PD 分离的必要性，首先需要看透 LLM 推理过程的本质。大模型生成文本并非一蹴而就，而是分为两个特征迥异的阶段：

### 1. 预填充阶段（Prefill）：计算密集的“阅读理解”
当用户输入一段 Prompt 时，模型需要一次性处理所有输入 Token，计算注意力机制中的 Q、K、V 矩阵，并构建出初始的键值缓存（KV Cache）。
*   **计算特性**：这是一个**计算密集型（Compute-Bound）** 任务。由于输入 Token 之间可以并行计算，该阶段对 GPU 的绝对算力（FLOPs）要求极高，但持续时间较短。
*   **核心指标**：直接决定了用户的首字延迟（TTFT）。

### 2. 解码阶段（Decode）：内存带宽密集的“逐字默写”
在生成首个 Token 后，模型进入自回归生成模式，基于已有的 KV Cache 逐个预测并生成后续 Token。
*   **计算特性**：这是一个**内存带宽密集型（Memory Bandwidth-Bound）** 任务。由于生成的自回归特性，计算必须串行进行，单次计算量小，但需要频繁且大量地从显存中读取 KV Cache。
*   **核心指标**：直接决定了 token 的生成速度（ITL）和整体吞吐量。

### 3. 传统统一架构的“三大原罪”
在传统的统一推理引擎中，Prefill 和 Decode 共享同一组 GPU。这种设计带来了致命的干扰：
1.  **Prefill 中断灾难**：当一个包含数千 Token 的长文本请求到来时，其庞大的 Prefill 计算会抢占 GPU 资源，直接打断正在进行的 Decode 任务，导致其他用户的生成延迟瞬间飙升。
2.  **资源错配**：Prefill 需要高算力，Decode 需要高显存带宽。同一张 GPU 很难在两个阶段都保持极高的利用率，导致“算力与带宽无法兼顾”。
3.  **内存碎片化**：两个阶段混合调度，使得 KV Cache 的内存管理变得极其复杂，容易引发显存碎片和 OOM（Out of Memory）错误。

## 二、 破局之道：Prefill-Decode 分离架构的核心原理

“双流”架构的核心思想是**计算资源解耦**。既然两个阶段的“性格”不同，不如让它们在不同的硬件实例上独立运行，通过高速网络进行协同。

### 1. 物理与逻辑的双重分离
在 PD 分离架构中，系统被拆分为两个独立的集群：
*   **Prefill 集群**：专门负责处理输入 Prompt，计算并生成 KV Cache。由于不需要维持长期的生成状态，这里可以使用算力性价比高、但显存带宽相对较弱的 GPU（例如消费级的 RTX 4090D）。
*   **Decode 集群**：专门负责接收 KV Cache 并逐 Token 生成。这里需要极大的显存带宽来支撑高频的访存，因此更适合部署显存带宽巨大的数据中心级 GPU（如 A100/H100）。

### 2. KV Cache 的高效传输机制
分离架构的最大挑战在于：Prefill 节点计算出的 KV Cache 需要实时传输给 Decode 节点。如果通过网络传输产生高延迟，分离带来的收益将被传输开销抵消。
为此，现代框架（如 SGLang、vLLM）引入了**零拷贝传输技术**。通过利用 RDMA（远程直接内存访问）或 NVLink 等高速互联技术，KV Cache 可以在 GPU 显存之间直接搬运，绕过 CPU 和操作系统内核，将传输延迟压缩至微秒级别。

## 三、 实战演练：基于 SGLang 部署 PD 分离服务

SGLang 是目前支持 PD 分离架构最成熟的开源框架之一。下面我们以部署 Llama-3.1-8B 模型为例，展示如何在单节点多卡环境下实现“双流”部署。

首先，确保安装了 SGLang 及其传输引擎依赖：
```bash
# 安装 SGLang 核心库
pip install sglang

# 安装 Mooncake 传输引擎（推荐用于生产环境的高性能传输）
uv pip install mooncake-transfer-engine
```

接下来，我们需要分别启动 Prefill 服务、Decode 服务以及负责调度的路由服务：

```bash
# 1. 启动 Prefill 服务 (分配给 GPU 0，专注于计算)
python -m sglang.launch_server \
  --model-path meta-llama/Llama-3.1-8B-Instruct \
  --disaggregation-mode prefill \
  --disaggregation-ib-device mlx5_roce0 \
  --port 30000

# 2. 启动 Decode 服务 (分配给 GPU 1，专注于显存带宽)
python -m sglang.launch_server \
  --model-path meta-llama/Llama-3.1-8B-Instruct \
  --disaggregation-mode decode \
  --disaggregation-ib-device mlx5_roce0 \
  --port 30001 \
  --base-gpu-id 1

# 3. 启动路由服务 (作为统一入口，智能分发请求)
python -m sglang_router.launch_router \
  --pd-disaggregation \
  --prefill http://127.0.0.1:30000 \
  --decode http://127.0.0.1:30001 \
  --host 0.0.0.0 \
  --port 8000
```

**架构解析**：
在这个架构中，`sglang_router` 扮演了“交通指挥官”的角色。当用户请求到达时，Router 会先将其路由到 Prefill 节点；Prefill 节点完成计算后，通过底层传输引擎将 KV Cache 无缝“接力”给 Decode 节点；最后由 Decode 节点流式返回生成结果。这种设计不仅消除了长文本对短文本生成的干扰，还能让整体吞吐量提升 2 倍以上。

## 四、 场景落地与未来展望

### 1. 核心应用场景
*   **长文本与 RAG（检索增强生成）**：在处理几十万字文档的摘要或问答时，Prefill 阶段耗时极长。PD 分离可以确保长文本的预填充不会阻塞其他并发用户的短对话生成。
*   **高并发多轮对话**：在客服、代码助手等场景中，多轮对话会产生大量的 Decode 任务。分离架构能最大化 Decode 集群的显存利用率，支撑更高的并发连接数。
*   **推理大模型（Reasoning Models）**：如 o1 等具备长思维链（CoT）的模型，其 Decode 阶段极长，PD 分离能显著优化其生成体验。

### 2. 未来展望
PD 分离架构并非终点，而是 LLM 推理优化的一个重要里程碑。未来，它将与更多前沿技术深度融合：
*   **结合投机解码（Speculative Decoding）**：在 Decode 节点引入小模型进行草稿生成，进一步突破自回归生成的串行瓶颈。
*   **更极致的异构计算**：从 GPU 之间的分离，走向 CPU、NPU、甚至 FPGA 的异构协同，将不同算力单元的特性发挥到极致。
*   **KV Cache 压缩与共享**：通过量化、剪枝等技术压缩 KV Cache 体积，降低跨节点传输的带宽压力，使得跨机房的分布式 PD 分离成为可能。

## 总结

Prefill-Decode 分离架构（双流Transformer）通过精准识别 LLM 推理中“计算密集”与“内存带宽密集”的双重特性，打破了传统统一调度的性能桎梏。它不仅是一种软件层面的调度优化，更是对底层硬件资源分配逻辑的重构。随着 SGLang、vLLM 等框架的不断完善，以及 RDMA 等高速互联技术的普及，PD 分离必将成为未来大规模 AI 推理服务的标准范式。对于 AI 工程师而言，掌握这一架构，将是构建高性能、低成本大模型应用的关键钥匙。

***

**参考来源：**
1. 《用基础模型构建应用(第九章)AI Engineering 学习笔记 - LLM 推理的瓶颈细分》，CSDN博客。
2. 《探秘Transformer系列之(24)--- KV Cache优化》，CSDN博客。
3. 《LLM大模型系列(十):深度解析 Prefill-Decode 分离式部署架构》，CSDN博客。
4. 《vLLM 异构三卡部署4090D 做 Prefill，双 A100 做 Decode》，CSDN博客。
5. 《突破万亿参数模型瓶颈:SGLang流水线并行技术的终极优化指南》，GitCode/SGLang 官方文档。