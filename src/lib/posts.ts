import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

/** 从集合 id（文件名去掉扩展名）中提取 Jekyll 风格的 slug：去掉日期前缀，保留中文与标点原样 */
export function postSlug(id: string): string {
  return id.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

/** 从集合 id 中提取文件名日期前缀，用于构造与原 Jekyll permalink 一致的 URL */
function fileNameDate(id: string): { year: string; month: string; day: string } {
  const m = id.match(/^(\d{4})-(\d{2})-(\d{2})-/);
  if (!m) throw new Error(`文章文件名缺少日期前缀: ${id}`);
  return { year: m[1], month: m[2], day: m[3] };
}

/** 与原 Jekyll permalink `/:year/:month/:title/` 完全一致的文章 URL */
export function postUrl(post: Post): string {
  const { year, month } = fileNameDate(post.id);
  return `/${year}/${month}/${encodeURIComponent(postSlug(post.id))}/`;
}

/** 按东八区格式化日期为 YYYY-MM-DD，与 Jekyll `%F` 输出一致 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(date);
}

/** 全部文章，按日期倒序（置顶排序由页面自行处理） */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts');
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** 从 Markdown 原文提取纯文本摘要，用于列表与 meta description */
export function plainExcerpt(body: string | undefined, maxLength = 250): string {
  if (!body) return '';
  const text = body
    .replace(/```[\s\S]*?```/g, ' ') // 代码块
    .replace(/`[^`]*`/g, ' ') // 行内代码
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // 图片
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 链接保留文字
    .replace(/^\s*[-*+]\s+/gm, '') // 列表符号
    .replace(/^\s*>+\s*/gm, '') // 引用符号
    .replace(/^#{1,6}\s+/gm, '') // 标题符号
    .replace(/^\s*\|?[\s:|-]+\|?\s*$/gm, ' ') // 表格分隔行与水平分割线
    .replace(/\|/g, ' ') // 表格竖线
    .replace(/[*_~#]/g, '') // 强调符号
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

/** 按分类分组，Others 固定排在最后（与原分类页行为一致） */
export function groupByCategory(posts: Post[]): [string, Post[]][] {
  const map = new Map<string, Post[]>();
  for (const post of posts) {
    const category = post.data.category;
    if (!map.has(category)) map.set(category, []);
    map.get(category)!.push(post);
  }
  const entries = [...map.entries()];
  entries.sort(([a], [b]) => {
    if (a === 'Others') return 1;
    if (b === 'Others') return -1;
    return a.localeCompare(b);
  });
  return entries;
}
