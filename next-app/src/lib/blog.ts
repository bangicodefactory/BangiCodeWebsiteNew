import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Filesystem-backed blog. Posts are MDX files under
 * `content/blog/<locale>/<slug>.mdx` with frontmatter:
 *
 *     ---
 *     title: "..."
 *     description: "..."
 *     date: 2026-08-05
 *     ---
 *
 * There are no posts yet, and none have been invented — the studio publishes
 * when it has something to say. Everything here is written to work the moment
 * the first .mdx file lands: drop it in, and the index and detail routes pick
 * it up with no code change.
 *
 * Locales are independent directories rather than translations of one post, so
 * a post can exist in `en` without forcing a machine translation into `ar`.
 */

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  /** ISO date string, or null when frontmatter omits/malforms it. */
  date: string | null;
}

export interface BlogPost extends BlogPostMeta {
  /** MDX body with frontmatter stripped. */
  body: string;
}

function localeDir(locale: string): string {
  return path.join(BLOG_DIR, locale);
}

function readPostFile(locale: string, slug: string): BlogPost | null {
  const file = path.join(localeDir(locale), `${slug}.mdx`);
  // Guard against a slug escaping the locale directory via traversal.
  if (!file.startsWith(localeDir(locale) + path.sep)) return null;
  if (!fs.existsSync(file)) return null;

  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const rawDate = data.date;
  const parsed =
    rawDate instanceof Date
      ? rawDate
      : typeof rawDate === "string"
        ? new Date(rawDate)
        : null;

  return {
    slug,
    title: typeof data.title === "string" ? data.title : slug,
    description: typeof data.description === "string" ? data.description : "",
    date:
      parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString() : null,
    body: content,
  };
}

export function getPostSlugs(locale: string): string[] {
  const dir = localeDir(locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

/** Post metadata for the index, newest first. Undated posts sort last. */
export function getPosts(locale: string): BlogPostMeta[] {
  return getPostSlugs(locale)
    .map((slug) => readPostFile(locale, slug))
    .filter((p): p is BlogPost => p !== null)
    .map(
      (p): BlogPostMeta => ({
        slug: p.slug,
        title: p.title,
        description: p.description,
        date: p.date,
      }),
    )
    .sort((a, b) => {
      if (a.date === b.date) return a.slug.localeCompare(b.slug);
      if (!a.date) return 1;
      if (!b.date) return -1;
      return b.date.localeCompare(a.date);
    });
}

export function getPost(locale: string, slug: string): BlogPost | null {
  return readPostFile(locale, slug);
}
