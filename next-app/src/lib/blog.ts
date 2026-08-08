import { unstable_cache } from "next/cache";
import { query } from "./db";

/**
 * Blog posts, read from the database. See ADR 0003.
 *
 * Posts are per-locale rows: `posts` holds the slug and date, and one
 * `post_translations` row per language carries the title, description and MDX
 * body. A post is only LIVE in the locales that have a row, which is why the
 * admin refuses to publish until all three exist — a half-translated post
 * renders in one language and 404s in another.
 *
 * The body is still MDX, compiled at render time by next-mdx-remote. Moving
 * storage to a database did not change what an author writes.
 */

/** Invalidated by the admin on publish — see revalidateTag in actions.ts. */
export const POSTS_TAG = "posts";

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  /** Calendar day, `YYYY-MM-DD`, or null when unset. */
  date: string | null;
}

export interface BlogPost extends BlogPostMeta {
  /** MDX body. */
  body: string;
}

interface PostRow {
  slug: string;
  date: string | null;
  title: string;
  description: string;
  body: string;
}

/**
 * Every post for one locale, newest first, undated last.
 *
 * Sorted in SQL rather than in JS so the ordering is the database's problem
 * and stays correct as the table grows.
 */
async function readPosts(locale: string): Promise<BlogPost[]> {
  const rows = await query<PostRow>(
    `SELECT p.slug, p.date, t.title, t.description, t.body
       FROM posts p
       JOIN post_translations t ON t.post_id = p.id
      WHERE t.locale = ?
      ORDER BY p.date DESC, p.slug ASC`,
    [locale],
  );

  return rows.map((r) => ({
    slug: r.slug,
    title: r.title,
    description: r.description,
    date: r.date,
    body: r.body,
  }));
}

/*
 * Cached per locale. The key includes the locale because unstable_cache keys
 * on the arguments, and a shared key would serve the English post list to a
 * reader on /ar. Both share one tag, so a publish invalidates all three at
 * once — which is correct, since a publish writes all three.
 */
const cachedPosts = unstable_cache(readPosts, ["blog-posts"], {
  tags: [POSTS_TAG],
});

export async function getPosts(locale: string): Promise<BlogPostMeta[]> {
  const posts = await cachedPosts(locale);
  return posts.map(({ slug, title, description, date }) => ({
    slug,
    title,
    description,
    date,
  }));
}

export async function getPost(
  locale: string,
  slug: string,
): Promise<BlogPost | null> {
  const posts = await cachedPosts(locale);
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function getPostSlugs(locale: string): Promise<string[]> {
  const posts = await cachedPosts(locale);
  return posts.map((p) => p.slug);
}
