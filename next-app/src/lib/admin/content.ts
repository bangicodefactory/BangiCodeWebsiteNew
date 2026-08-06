import matter from "gray-matter";
import { z } from "zod";
import { routing, type Locale } from "@/i18n/routing";
import { projectSchema, type Project } from "@/lib/portfolio-schema";
import type { AdminConfig } from "./config";
import {
  commitFiles,
  getFile,
  listDirectory,
  type FileChange,
  type Result,
} from "./github";

/**
 * Blog posts and portfolio projects, read from and written to the repository.
 *
 * Both content types publish as a SINGLE commit covering every locale. With
 * "all three locales required" as a locked rule, a partial write is not a
 * smaller success — it is a post the site renders in one language and 404s in
 * another. `commitFiles` takes the whole set at once for exactly this reason.
 */

const LOCALES = routing.locales;

/**
 * Guards the slug before it is ever interpolated into a repository path.
 * `../../` in a slug would otherwise let the CMS write outside content/ — the
 * one input here that reaches a filesystem-shaped API.
 */
export const slugSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers and single hyphens (e.g. how-we-scope-projects)",
  );

/* ── Blog ──────────────────────────────────────────────────────────────── */

export const blogLocaleSchema = z.object({
  title: z.string().min(1, "Title is required").max(140),
  description: z.string().min(1, "Description is required").max(300),
  body: z.string().min(1, "Body is required"),
});

export const blogPostSchema = z.object({
  slug: slugSchema,
  /** ISO yyyy-mm-dd. Shared across locales — it is one post. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD"),
  content: z.object(
    Object.fromEntries(LOCALES.map((l) => [l, blogLocaleSchema])) as Record<
      Locale,
      typeof blogLocaleSchema
    >,
  ),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;

export interface BlogPostSummary {
  slug: string;
  date: string | null;
  title: string;
  /** Locales that actually have a file. A post is only live in all of them. */
  locales: Locale[];
  complete: boolean;
}

function blogPath(locale: string, slug: string): string {
  return `content/blog/${locale}/${slug}.mdx`;
}

function serialiseBlog(post: BlogPostInput, locale: Locale): string {
  const c = post.content[locale];
  // gray-matter/js-yaml handles quoting and escaping — never hand-roll YAML.
  return matter.stringify(c.body.trim() + "\n", {
    title: c.title,
    description: c.description,
    date: post.date,
  });
}

export async function listBlogPosts(
  config: AdminConfig,
  token: string,
): Promise<Result<BlogPostSummary[]>> {
  const bySlug = new Map<
    string,
    { locales: Locale[]; title: string; date: string | null }
  >();

  for (const locale of LOCALES) {
    const listed = await listDirectory(config, token, `content/blog/${locale}`);
    if (!listed.ok) return listed;

    for (const entry of listed.value) {
      if (entry.type !== "file" || !entry.name.endsWith(".mdx")) continue;
      const slug = entry.name.replace(/\.mdx$/, "");
      const existing = bySlug.get(slug) ?? {
        locales: [],
        title: slug,
        date: null,
      };
      existing.locales.push(locale);
      bySlug.set(slug, existing);
    }
  }

  /*
   * Titles and dates come from the default locale only. Fetching frontmatter
   * for every locale would be 3 requests per post to render a list — the
   * default-locale file is enough to label a row, and the editor loads all
   * three when you open it.
   */
  for (const [slug, info] of bySlug) {
    if (!info.locales.includes(routing.defaultLocale)) continue;
    const file = await getFile(
      config,
      token,
      blogPath(routing.defaultLocale, slug),
    );
    if (!file.ok) return file;
    if (file.value) {
      const parsed = matter(file.value.text);
      const data = parsed.data as { title?: string; date?: unknown };
      info.title = typeof data.title === "string" ? data.title : slug;
      info.date = normaliseDate(data.date);
    }
  }

  const posts: BlogPostSummary[] = [...bySlug.entries()]
    .map(([slug, info]) => ({
      slug,
      date: info.date,
      title: info.title,
      locales: info.locales,
      complete: LOCALES.every((l) => info.locales.includes(l)),
    }))
    .sort((a, b) => {
      if (a.date === b.date) return a.slug.localeCompare(b.slug);
      if (!a.date) return 1;
      if (!b.date) return -1;
      return b.date.localeCompare(a.date);
    });

  return { ok: true, value: posts };
}

export async function getBlogPost(
  config: AdminConfig,
  token: string,
  slug: string,
): Promise<Result<BlogPostInput | null>> {
  const content = {} as BlogPostInput["content"];
  let date: string | null = null;
  let found = false;

  for (const locale of LOCALES) {
    const file = await getFile(config, token, blogPath(locale, slug));
    if (!file.ok) return file;
    if (!file.value) {
      content[locale] = { title: "", description: "", body: "" };
      continue;
    }
    found = true;
    const parsed = matter(file.value.text);
    const data = parsed.data as {
      title?: string;
      description?: string;
      date?: unknown;
    };
    date ??= normaliseDate(data.date);
    content[locale] = {
      title: typeof data.title === "string" ? data.title : "",
      description: typeof data.description === "string" ? data.description : "",
      body: parsed.content.trim(),
    };
  }

  if (!found) return { ok: true, value: null };
  return {
    ok: true,
    value: { slug, date: date ?? today(), content },
  };
}

export async function saveBlogPost(
  config: AdminConfig,
  token: string,
  post: BlogPostInput,
  author: { name: string; email: string },
  isNew: boolean,
): Promise<Result<{ sha: string; url: string }>> {
  const changes: FileChange[] = LOCALES.map((locale) => ({
    path: blogPath(locale, post.slug),
    content: serialiseBlog(post, locale),
  }));

  return commitFiles(
    config,
    token,
    `${isNew ? "content: add" : "content: update"} blog post "${post.slug}"\n\n` +
      `${LOCALES.join(", ")} — published via the CMS by ${author.name}.`,
    changes,
    author,
  );
}

export async function deleteBlogPost(
  config: AdminConfig,
  token: string,
  slug: string,
  existingLocales: Locale[],
  author: { name: string; email: string },
): Promise<Result<{ sha: string; url: string }>> {
  // Only delete paths that exist — the tree API errors on a missing path.
  const changes: FileChange[] = existingLocales.map((locale) => ({
    path: blogPath(locale, slug),
    delete: true,
  }));

  return commitFiles(
    config,
    token,
    `content: remove blog post "${slug}"\n\nDeleted via the CMS by ${author.name}.`,
    changes,
    author,
  );
}

/* ── Portfolio ─────────────────────────────────────────────────────────── */

function projectPath(slug: string): string {
  return `content/portfolio/${slug}.json`;
}

export async function listProjectFiles(
  config: AdminConfig,
  token: string,
): Promise<Result<Project[]>> {
  const listed = await listDirectory(config, token, "content/portfolio");
  if (!listed.ok) return listed;

  const projects: Project[] = [];
  for (const entry of listed.value) {
    if (entry.type !== "file" || !entry.name.endsWith(".json")) continue;
    const file = await getFile(config, token, entry.path);
    if (!file.ok) return file;
    if (!file.value) continue;
    try {
      const parsed = projectSchema.safeParse(JSON.parse(file.value.text));
      // A file that fails validation is surfaced in the list rather than
      // dropped, so a broken project is visible in the CMS instead of just
      // silently missing from the site.
      if (parsed.success) projects.push(parsed.data);
    } catch {
      /* unparseable file — skip; the build guard reports it loudly */
    }
  }
  return { ok: true, value: projects.sort((a, b) => a.order - b.order) };
}

export async function getProjectFile(
  config: AdminConfig,
  token: string,
  slug: string,
): Promise<Result<Project | null>> {
  const file = await getFile(config, token, projectPath(slug));
  if (!file.ok) return file;
  if (!file.value) return { ok: true, value: null };
  try {
    const parsed = projectSchema.safeParse(JSON.parse(file.value.text));
    return { ok: true, value: parsed.success ? parsed.data : null };
  } catch {
    return { ok: true, value: null };
  }
}

export async function saveProject(
  config: AdminConfig,
  token: string,
  project: Project,
  author: { name: string; email: string },
  isNew: boolean,
): Promise<Result<{ sha: string; url: string }>> {
  return commitFiles(
    config,
    token,
    `${isNew ? "content: add" : "content: update"} project "${project.slug}"\n\n` +
      `Published via the CMS by ${author.name}.`,
    [
      {
        path: projectPath(project.slug),
        content: JSON.stringify(project, null, 2) + "\n",
      },
    ],
    author,
  );
}

export async function deleteProject(
  config: AdminConfig,
  token: string,
  slug: string,
  author: { name: string; email: string },
): Promise<Result<{ sha: string; url: string }>> {
  return commitFiles(
    config,
    token,
    `content: remove project "${slug}"\n\nDeleted via the CMS by ${author.name}.`,
    [{ path: projectPath(slug), delete: true }],
    author,
  );
}

/* ── helpers ───────────────────────────────────────────────────────────── */

function normaliseDate(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string") {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return null;
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Commits are attributed to the signed-in person. GitHub's `noreply` address
 * links the commit to their account without exposing a private email — the CMS
 * never asks for one and never stores one.
 */
export function commitAuthor(user: { login: string; name: string }): {
  name: string;
  email: string;
} {
  return {
    name: user.name || user.login,
    email: `${user.login}@users.noreply.github.com`,
  };
}
