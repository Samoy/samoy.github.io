import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/posts',
    // 保留文件名原样（含中文与大写字母），确保 slug 与 Jekyll permalink 一致
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    category: z.string().default('Others'),
    date: z.coerce.date(),
    istop: z.boolean().optional(),
    keywords: z.string().optional(),
    excerpt: z.string().optional(),
    // Jekyll 遗留字段，仅做兼容保留
    layout: z.string().optional(),
  }),
});

export const collections = { posts };
