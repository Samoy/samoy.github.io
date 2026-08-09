## Samoy 的博客（Astro 版）

本站已从 Jekyll 迁移到 [Astro](https://astro.build)。详细迁移说明见 [MIGRATION.md](./MIGRATION.md)。

### 1、下载

```shell
git clone https://github.com/Samoy/Samoy.github.io.git
```

### 2、安装依赖（需要 Node 20+）

```shell
npm install
```

### 3、本地运行

```shell
npm run dev        # 开发服务器 http://localhost:4321
npm run build      # 一次性构建到 dist/
npm run preview    # 预览构建产物
```

### 4、写博客

在 `src/content/posts/` 下新建 `YYYY-MM-DD-标题.md`，front matter 至少包含：

```yaml
---
title: 文章标题
category: Web
date: 2026-08-08 20:50:00 +08:00
---
```

### 5、常用修改位置

* `src/site.config.ts` —— 站点信息、导航、社交链接、giscus、备案号（对应原 `_config.yml`）
* `src/content/posts/` —— 文章
* `src/components/` —— 页面片段（侧栏、页脚、评论、卡片等）
* `src/layouts/Base.astro` —— 全局布局
* `src/styles/global.css` —— 全部样式（设计令牌在文件顶部）
* `src/pages/` —— 路由页面
