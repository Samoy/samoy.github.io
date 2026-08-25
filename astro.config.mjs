import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkGfm from 'remark-gfm';
import remarkMermaid from './src/plugins/remark-mermaid.mjs';
import remarkCodeLang from './src/plugins/remark-code-lang.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.samoy.fun',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [remarkGfm, remarkMermaid, remarkCodeLang],
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});
