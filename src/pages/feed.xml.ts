import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { render } from 'astro:content';
import { getPosts, plainExcerpt, postUrl } from '../lib/posts';
import { siteConfig } from '../site.config';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  const items = await Promise.all(
    posts.map(async (post) => {
      const { html } = await render(post);
      return {
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.excerpt ?? plainExcerpt(post.body, 160),
        link: postUrl(post),
        content: html,
        categories: [post.data.category],
      };
    }),
  );

  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: context.site!,
    items,
    customData: `<language>zh-CN</language>`,
  });
}
