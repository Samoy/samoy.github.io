# Repository Guidelines

This is **编程手札** (samoy.github.io), a personal blog built with [Astro](https://astro.build). It deploys to GitHub Pages via GitHub Actions from the `master` branch. There is no test suite; verify locally before pushing.

## Project Structure

- `src/content/posts/` — blog articles (Markdown with YAML front matter)
- `src/layouts/Base.astro` — global shell (sidebar + content + footer)
- `src/components/` — reusable partials (Header, Footer, BaseHead, Comments, PostCard, Pagination, ReadMore, HomeHero)
- `src/pages/` — routes (`index.astro`, `[...path].astro` for posts, `timeline.astro`, `categories.astro`, `about.astro`, `404.astro`, `page/[...num].astro`, `feed.xml.ts`)
- `src/styles/global.css` — all styles; design tokens at the top (light/dark via `data-theme`)
- `src/site.config.ts` — site config: title, nav, social links, giscus, ICP (the old `_config.yml`)
- `src/lib/posts.ts` — slug/URL/excerpt/category helpers
- `src/plugins/` — remark plugins (`remark-mermaid.mjs`, `remark-code-lang.mjs`)
- `public/assets/images/` — article images; reference them as `/assets/images/<file>`
- `public/CNAME` — custom domain
- Generated output (`dist/`, `.astro/`, `node_modules/`) is gitignored — never commit it.

## Build & Development Commands

```shell
npm install        # install dependencies (Node 20+)
npm run dev        # dev server at http://localhost:4321
npm run build      # one-shot build into dist/
npm run preview    # preview the production build
```

Integrations (declared in `astro.config.mjs`): `@astrojs/sitemap`, `@astrojs/rss`, `remark-gfm`.

## Writing Articles

- File name: `src/content/posts/YYYY-MM-DD-<title>.md`; the URL is `/:year/:month/:title/` (slug = filename minus the date prefix, case and Chinese preserved).
- Required front matter:

  ```yaml
  ---
  title: 文章标题
  category: AI
  date: 2026-08-08 20:50:00 +08:00
  ---
  ```

- Markdown uses GFM; Mermaid code fences (` ```mermaid `) render as diagrams.
- Articles are written in Chinese; keep titles and filenames consistent with existing posts.

## Coding Style

- Astro components: 2-space indentation; TypeScript in frontmatter.
- Styles live in `src/styles/global.css` (plain CSS with custom properties); client JS is inline `<script>` in components (vanilla, no jQuery).
- No linter or formatter is configured — match surrounding code.

## Testing

There is no test framework. Verify changes locally with `npm run build` (must complete with no errors) and `npm run preview`, then spot-check pages in a browser before pushing.

## Commit & Pull Request Guidelines

Git history mixes two styles; follow the closest match:

- Articles: `发布文章: <title>`, `修改文章: <title>`, `修正文章: <title>`
- Code/config: Conventional Commits, e.g. `feat: 添加评论功能`, `fix: typo`, `refactor(config): 移除谷歌分析相关代码`, `docs(ai): ...`, `chore: 添加mermaid支持`

Keep commits small and focused. Pushes to `master` deploy to production via GitHub Actions, so preview locally first. PRs should describe the change and include screenshots for visual changes.

## Configuration Tips

- Site URL lives in `astro.config.mjs` (`site`); the domain is `public/CNAME` — keep them consistent.
- Comment system (giscus), social links, navigation, and ICP numbers are all configured in `src/site.config.ts`.
- Deploy source must be "GitHub Actions" in the repo's Pages settings.
