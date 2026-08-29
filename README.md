# 编程手札

Samoy 的个人技术博客，基于 [Astro](https://astro.build) 构建，静态输出，部署于 [GitHub Pages](https://www.samoy.site)

## 1、下载

```shell
git clone https://github.com/Samoy/Samoy.github.io.git
```

## 2、安装依赖（需要 Node 20+）

```shell
npm install
```

## 3、本地运行

```shell
npm run dev        # 开发服务器 http://localhost:4321
npm run build      # 一次性构建到 dist/
npm run preview    # 预览构建产物
```

## 4、写博客

在 `src/content/posts/` 下新建 `YYYY-MM-DD-标题.md`（文件名即 URL slug，保留中文与大小写），front matter 至少包含：

```yaml
---
title: 文章标题
category: Web
date: 2026-08-08 20:50:00 +08:00
---
```

可选字段：`istop: true`（置顶）、`excerpt`（自定义摘要）。正文支持 GFM 表格与 ` ```mermaid ` 图表。

## 5、常用修改位置

* `src/site.config.ts` —— 站点信息、导航、社交链接、giscus 评论、备案号
* `src/content/posts/` —— 文章
* `src/components/` —— 页面片段（侧栏、页脚、评论、卡片等）
* `src/layouts/Base.astro` —— 全局布局
* `src/styles/global.css` —— 全部样式（设计令牌在文件顶部，含明暗主题）
* `src/pages/` —— 路由页面（首页、文章、目录、分类、关于、404、RSS）
* `astro.config.mjs` —— 站点 URL、集成与 Markdown 插件

## 6、部署

推送到 `master` 后，GitHub Actions（`.github/workflows/deploy.yml`）自动构建 `dist/` 并部署到 GitHub Pages；自定义域名由 `public/CNAME` 提供。
