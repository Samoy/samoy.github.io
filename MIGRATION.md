# Jekyll → Astro 迁移说明

本文档记录本站从 Jekyll（Vno 主题）迁移到 Astro 5 的完整过程、新旧结构映射、功能对照与部署切换步骤。迁移在 `feat/astro-migration` 分支进行，`master` 分支保持原样，可随时回滚。

## 一、为什么迁移

- Jekyll 主题（Vno）基于 jQuery + Font Awesome + Sass，构建链陈旧，移动端与可访问性体验落后。
- Astro 默认零 JS 输出、按路由生成静态 HTML，天然适合博客，且对 SEO 与性能更友好。
- 借迁移机会重做视觉设计（"手札"主题），统一明暗双主题。

## 二、新旧目录结构映射

| Jekyll | Astro | 说明 |
|---|---|---|
| `_config.yml` | `src/site.config.ts` | 站点信息、导航、社交、giscus、备案号 |
| `_posts/*.md` | `src/content/posts/*.md` | 文章原样迁移；`.markdown` 统一改 `.md` |
| `_layouts/default.html` | `src/layouts/Base.astro` | 全局外壳（侧栏 + 内容 + 页脚） |
| `_layouts/post.html` | `src/pages/[...path].astro` | 文章详情页 |
| `_includes/head.html` | `src/components/BaseHead.astro` | SEO / meta / 字体 / 主题初始化 |
| `_includes/side-panel.html` | `src/components/Header.astro` | 侧栏（桌面）/ 抽屉（移动） |
| `_includes/footer.html` | `src/components/Footer.astro` | 页脚 + 备案 + 不蒜子 |
| `_includes/comments.html` | `src/components/Comments.astro` | giscus 评论 |
| `_includes/pagination.html` | `src/components/Pagination.astro` | 分页 |
| `_includes/read-more.html` | `src/components/ReadMore.astro` | 上一篇 / 下一篇 |
| `index.html`（分页） | `src/pages/index.astro` + `src/pages/page/[...num].astro` | 首页 + `/page/N/` |
| `timeline.html` | `src/pages/timeline.astro` | 时间线 + 站内搜索 |
| `categories.html` | `src/pages/categories.astro` | 分类（锚点分组，Others 置底） |
| `about.html` | `src/pages/about.astro` | 关于 |
| `404.md` | `src/pages/404.astro` | 404 |
| `feed.xml` | `src/pages/feed.xml.ts` | RSS（路径不变） |
| `_sass/` + `css/main.scss` | `src/styles/global.css` | 全部样式重写 |
| `js/main.js` + `js/particles.js` | 组件内 `<script>` | 去 jQuery / particles，原生重写 |
| `assets/images/` | `public/assets/images/` | 图片路径零改动 |
| `CNAME` | `public/CNAME` | 自定义域名 |
| （无） | `.github/workflows/deploy.yml` | GitHub Actions 部署 |

## 三、URL 保持不变（SEO 关键）

- 文章 permalink 维持 `/:year/:month/:title/`，slug 由文件名去掉日期前缀得到，保留中文与大小写（如 `/2016/03/iOS一个弹出的时间选择器(UIDatePicker)/`）。
- 通过 `src/content.config.ts` 的 `generateId` 保留文件名原样，避免 Astro 默认小写化。
- 分页维持 `/page/2/`、`/page/3/`…；首页为 `/`。
- `trailingSlash: 'always'` + `build.format: 'directory'` 保留尾斜杠。

## 四、功能对照与实现要点

| 功能 | 实现 |
|---|---|
| 分页（10 篇/页） | `index.astro`（第 1 页）+ `page/[...num].astro`（第 2 页起） |
| 时间线 + 搜索 + 置顶 | `timeline.astro`，原生 JS 过滤，`istop` 排前 |
| 分类（Others 置底） | `categories.astro` + `groupByCategory()` |
| 评论 | giscus，配置在 `site.config.ts`，仅文章页加载 |
| Mermaid | `remark-mermaid.mjs` 转为 `<pre class="mermaid">`，客户端按需懒加载 |
| 代码高亮 | Shiki（`github-dark`），`remark-code-lang.mjs` 修正非标准语言标识 |
| RSS | `@astrojs/rss`，输出 `/feed.xml` |
| sitemap | `@astrojs/sitemap` |
| 打字机副标题 | `HomeHero.astro` 原生重写，尊重 `prefers-reduced-motion` |
| 不蒜子统计 / 百度验证 | 保留在 `BaseHead.astro` / `Footer.astro` |
| 明暗主题 | CSS 变量 + `data-theme`，跟随系统 + 手动切换 |
| 备案信息 | 首页显示在侧栏首屏，其他页面显示在页脚（与原规则一致） |

## 五、内容修正

迁移过程中修正了 4 篇文章 front matter 中非法的 YAML 时间（`HH.MM.SS` → `HH:MM:SS`）：

- `2026-08-08-多Agent协作.md`
- `2024-07-25-前端模拟面试.md`
- `2024-08-01-请使用performance.now()而不是new Date().getTime().md`
- `2024-06-06-JS中this的指向.md`
- `2024-10-07-MySQL储存过程和存储函数.md`

## 六、部署切换（合并后必做）

1. 将 `feat/astro-migration` 合并进 `master`。
2. 在仓库 **Settings → Pages** 中，把 **Build and deployment → Source** 从 "Deploy from a branch" 切换为 **"GitHub Actions"**。
3. 推送 `master` 后，`.github/workflows/deploy.yml` 会自动构建 `dist/` 并部署。
4. `public/CNAME` 会随构建产物带上自定义域名 `www.samoy.site`。

> 注意：若不切换 Pages Source，旧版 Jekyll 构建会尝试解析已删除的 `_config.yml` 而失败。

## 七、本地验证清单

- [x] `npm run build` 无错误，40 个页面生成
- [x] 32 篇文章 URL 与原 Jekyll permalink 一致
- [x] 首页 / 分页 / 时间线 / 分类 / 关于 / 404 / RSS / sitemap 均 200
- [x] 文章页 Mermaid 渲染、图片加载、giscus 挂载、上下篇正常
- [x] 移动端（390px）菜单抽屉、竖排副标题隐藏、无横向滚动
- [x] 明暗主题切换正常

## 八、回滚

`master` 分支未被修改。若需回滚，直接切回 `master` 即可，无需任何额外操作。
