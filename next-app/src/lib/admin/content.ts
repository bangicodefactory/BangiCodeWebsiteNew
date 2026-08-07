import { z } from "zod";
import type { PoolConnection } from "mysql2/promise";
import { routing, type Locale } from "@/i18n/routing";
import { projectSchema, type Project } from "@/lib/portfolio-schema";
import { query, withTransaction, type SqlValue } from "@/lib/db";

/**
 * Blog posts and portfolio projects, read from and written to the database.
 * See ADR 0003.
 *
 * Both content types publish in a SINGLE TRANSACTION covering every locale.
 * With "all three locales required" as a locked rule, a partial write is not a
 * smaller success — it is a post the site renders in one language and 404s in
 * another. ADR 0002 chose the Git Data API to get that atomicity; a
 * transaction gives the same guarantee more directly.
 *
 * Every write also records a snapshot in `content_revisions`. That table is
 * what buys back the history git was providing for free: without it, an
 * accidental overwrite has nothing to recover from.
 *
 * There is no `AdminConfig` parameter any more. The GitHub client needed a
 * repo, a branch and a token threaded through every call; the pool reads its
 * own configuration once.
 */

const LOCALES = routing.locales;

/**
 * Guards the slug before it reaches a URL or a filename-shaped value.
 *
 * Path traversal is no longer the threat it was when slugs became repository
 * paths — a parameterised query cannot be escaped by `../`. It still matters:
 * the slug is the public URL, and `hero.webp` is still derived from it.
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
  /** Locales that actually have a row. A post is only live in all of them. */
  locales: Locale[];
  complete: boolean;
}

export async function listBlogPosts(): Promise<BlogPostSummary[]> {
  /*
   * One query for the whole list, including which locales exist. The GitHub
   * version needed a directory listing per locale plus a file fetch per post
   * to read its title — seven round trips for two posts. This is one.
   */
  const rows = await query<{
    slug: string;
    date: string | null;
    locales: string;
    title: string | null;
  }>(
    `SELECT p.slug,
            p.date,
            GROUP_CONCAT(t.locale ORDER BY t.locale) AS locales,
            MAX(CASE WHEN t.locale = ? THEN t.title END) AS title
       FROM posts p
       LEFT JOIN post_translations t ON t.post_id = p.id
      GROUP BY p.id, p.slug, p.date
      ORDER BY p.date DESC, p.slug ASC`,
    [routing.defaultLocale],
  );

  return rows.map((row) => {
    const locales = (row.locales ?? "")
      .split(",")
      .filter((l): l is Locale => (LOCALES as readonly string[]).includes(l));
    return {
      slug: row.slug,
      date: row.date,
      title: row.title ?? row.slug,
      locales,
      complete: LOCALES.every((l) => locales.includes(l)),
    };
  });
}

export async function getBlogPost(slug: string): Promise<BlogPostInput | null> {
  const rows = await query<{
    date: string | null;
    locale: string;
    title: string;
    description: string;
    body: string;
  }>(
    `SELECT p.date, t.locale, t.title, t.description, t.body
       FROM posts p
       LEFT JOIN post_translations t ON t.post_id = p.id
      WHERE p.slug = ?`,
    [slug],
  );

  if (rows.length === 0) return null;

  // Missing locales come back as empty fields so the editor renders blank tabs
  // rather than refusing to open a partially-translated post.
  const content = {} as BlogPostInput["content"];
  for (const locale of LOCALES) {
    const row = rows.find((r) => r.locale === locale);
    content[locale] = {
      title: row?.title ?? "",
      description: row?.description ?? "",
      body: row?.body ?? "",
    };
  }

  return { slug, date: rows[0]?.date ?? today(), content };
}

export async function saveBlogPost(
  post: BlogPostInput,
  author: { id: number; name: string },
  isNew: boolean,
): Promise<void> {
  await withTransaction(async (conn) => {
    let postId: number;

    if (isNew) {
      const [result] = await conn.execute(
        "INSERT INTO posts (slug, date) VALUES (?, ?)",
        [post.slug, post.date],
      );
      postId = (result as { insertId: number }).insertId;
    } else {
      const [rows] = await conn.execute(
        "SELECT id FROM posts WHERE slug = ? LIMIT 1",
        [post.slug],
      );
      const found = (rows as { id: number }[])[0];
      if (!found) throw new Error("That post no longer exists.");
      postId = found.id;
      await conn.execute("UPDATE posts SET date = ? WHERE id = ?", [
        post.date,
        postId,
      ]);
    }

    for (const locale of LOCALES) {
      const c = post.content[locale];
      /*
       * Upsert per locale. ON DUPLICATE KEY hits the (post_id, locale) unique
       * index, so editing an existing translation and adding a missing one are
       * the same statement — and neither can create a second row for a locale.
       */
      await conn.execute(
        `INSERT INTO post_translations (post_id, locale, title, description, body)
              VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title = VALUES(title),
                                 description = VALUES(description),
                                 body = VALUES(body)`,
        [postId, locale, c.title, c.description, c.body.trim()],
      );
    }

    await recordRevision(conn, {
      entityType: "post",
      slug: post.slug,
      action: isNew ? "create" : "update",
      snapshot: post,
      author,
    });
  });
}

export async function deleteBlogPost(
  slug: string,
  author: { id: number; name: string },
): Promise<void> {
  await withTransaction(async (conn) => {
    // Snapshot BEFORE the delete — the whole point of the revision is to be
    // able to put back what was removed.
    const existing = await getBlogPost(slug);

    const [result] = await conn.execute("DELETE FROM posts WHERE slug = ?", [
      slug,
    ]);
    if ((result as { affectedRows: number }).affectedRows === 0) {
      throw new Error("That post no longer exists.");
    }
    // post_translations rows go with it via ON DELETE CASCADE.

    await recordRevision(conn, {
      entityType: "post",
      slug,
      action: "delete",
      snapshot: existing,
      author,
    });
  });
}

/* ── Portfolio ─────────────────────────────────────────────────────────── */

/**
 * One entry per project, valid or not.
 *
 * A row that fails validation is REPORTED, not dropped. Dropping it made a
 * corrupt project invisible in the CMS — the one place you would go to repair
 * it. `order` is read even from a rejected row, so the collision check still
 * sees the position it occupies.
 */
export interface ProjectListEntry {
  slug: string;
  /** null when the row does not satisfy the schema. */
  project: Project | null;
  /** Why it was rejected, for the CMS list. */
  problem?: string;
  order: number | null;
}

/** Convenience for callers that only care about publishable projects. */
export function validProjects(entries: ProjectListEntry[]): Project[] {
  return entries.map((e) => e.project).filter((p): p is Project => p !== null);
}

interface ProjectRow {
  id: number;
  slug: string;
  sort_order: number;
  category: string;
  date: string;
  tags: string;
  hero_placeholder: number;
  hero_webp: string;
  hero_alt: string;
  hero_width: number;
  hero_height: number;
}

function rowToCandidate(
  row: ProjectRow,
  content: Record<string, unknown>,
): unknown {
  let tags: string[] = [];
  try {
    const parsed: unknown = JSON.parse(row.tags);
    if (Array.isArray(parsed)) {
      tags = parsed.filter((t): t is string => typeof t === "string");
    }
  } catch {
    /* leave empty — the schema will reject it and say so */
  }

  return {
    slug: row.slug,
    order: row.sort_order,
    category: row.category,
    tags,
    date: row.date,
    hero: {
      placeholder: Boolean(row.hero_placeholder),
      webp: row.hero_webp,
      alt: row.hero_alt,
      width: row.hero_width,
      height: row.hero_height,
    },
    content,
  };
}

export async function listProjectFiles(): Promise<ProjectListEntry[]> {
  const rows = await query<ProjectRow>(
    `SELECT id, slug, sort_order, category, date, tags,
            hero_placeholder, hero_webp, hero_alt, hero_width, hero_height
       FROM projects ORDER BY sort_order ASC`,
  );
  if (rows.length === 0) return [];

  const translations = await query<{
    project_id: number;
    locale: string;
    name: string;
    summary: string;
    outcome: string;
  }>(
    "SELECT project_id, locale, name, summary, outcome FROM project_translations",
  );

  const byProject = new Map<number, Record<string, unknown>>();
  for (const t of translations) {
    const bucket = byProject.get(t.project_id) ?? {};
    bucket[t.locale] = { name: t.name, summary: t.summary, outcome: t.outcome };
    byProject.set(t.project_id, bucket);
  }

  return rows.map((row) => {
    const parsed = projectSchema.safeParse(
      rowToCandidate(row, byProject.get(row.id) ?? {}),
    );
    if (parsed.success) {
      return { slug: row.slug, project: parsed.data, order: row.sort_order };
    }
    const issue = parsed.error.issues[0];
    return {
      slug: row.slug,
      project: null,
      problem: issue && `${issue.path.join(".") || "row"}: ${issue.message}`,
      order: row.sort_order,
    };
  });
}

export async function getProjectFile(slug: string): Promise<Project | null> {
  const entries = await listProjectFiles();
  return entries.find((e) => e.slug === slug)?.project ?? null;
}

export async function saveProject(
  project: Project,
  author: { id: number; name: string },
  isNew: boolean,
): Promise<void> {
  await withTransaction(async (conn) => {
    let projectId: number;

    if (isNew) {
      const [result] = await conn.execute(
        `INSERT INTO projects
           (slug, sort_order, category, date, tags,
            hero_placeholder, hero_webp, hero_alt, hero_width, hero_height)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          project.slug,
          project.order,
          project.category,
          project.date,
          JSON.stringify(project.tags),
          project.hero.placeholder ? 1 : 0,
          project.hero.webp,
          project.hero.alt,
          project.hero.width,
          project.hero.height,
        ],
      );
      projectId = (result as { insertId: number }).insertId;
    } else {
      const [rows] = await conn.execute(
        "SELECT id FROM projects WHERE slug = ? LIMIT 1",
        [project.slug],
      );
      const found = (rows as { id: number }[])[0];
      if (!found) throw new Error("That project no longer exists.");
      projectId = found.id;
      await conn.execute(
        `UPDATE projects
            SET sort_order = ?, category = ?, date = ?, tags = ?,
                hero_placeholder = ?, hero_webp = ?, hero_alt = ?,
                hero_width = ?, hero_height = ?
          WHERE id = ?`,
        [
          project.order,
          project.category,
          project.date,
          JSON.stringify(project.tags),
          project.hero.placeholder ? 1 : 0,
          project.hero.webp,
          project.hero.alt,
          project.hero.width,
          project.hero.height,
          projectId,
        ],
      );
    }

    for (const locale of LOCALES) {
      const c = project.content[locale];
      await conn.execute(
        `INSERT INTO project_translations (project_id, locale, name, summary, outcome)
              VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name),
                                 summary = VALUES(summary),
                                 outcome = VALUES(outcome)`,
        [projectId, locale, c.name, c.summary, c.outcome],
      );
    }

    await recordRevision(conn, {
      entityType: "project",
      slug: project.slug,
      action: isNew ? "create" : "update",
      snapshot: project,
      author,
    });
  });
}

export async function deleteProject(
  slug: string,
  author: { id: number; name: string },
): Promise<void> {
  await withTransaction(async (conn) => {
    const existing = await getProjectFile(slug);

    const [result] = await conn.execute("DELETE FROM projects WHERE slug = ?", [
      slug,
    ]);
    if ((result as { affectedRows: number }).affectedRows === 0) {
      throw new Error("That project no longer exists.");
    }

    await recordRevision(conn, {
      entityType: "project",
      slug,
      action: "delete",
      snapshot: existing,
      author,
    });
  });
}

/* ── helpers ───────────────────────────────────────────────────────────── */

/**
 * Records what a write did, inside the same transaction as the write.
 *
 * Inside, deliberately: a revision that can survive a rolled-back write would
 * be a history of things that never happened, which is worse than no history.
 */
async function recordRevision(
  conn: PoolConnection,
  revision: {
    entityType: "post" | "project";
    slug: string;
    action: "create" | "update" | "delete";
    snapshot: unknown;
    author: { id: number; name: string };
  },
): Promise<void> {
  const params: SqlValue[] = [
    revision.entityType,
    revision.slug,
    revision.action,
    revision.snapshot === null ? null : JSON.stringify(revision.snapshot),
    revision.author.id,
    revision.author.name,
  ];
  await conn.execute(
    `INSERT INTO content_revisions
       (entity_type, entity_slug, action, snapshot, author_id, author_name)
     VALUES (?, ?, ?, ?, ?, ?)`,
    params,
  );
}

/*
 * Dates are calendar days in the studio's timezone, not UTC instants.
 *
 * toISOString() is UTC and Morocco runs UTC+1, so anything published after
 * 23:00 local was stamped with YESTERDAY's date. One hour of every day
 * produced a wrong answer, which is the kind of bug nobody reports because it
 * looks like a typo.
 */
const STUDIO_TIMEZONE = "Africa/Casablanca";

export function today(): string {
  // en-CA formats as YYYY-MM-DD, which is the shape the column wants.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: STUDIO_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Attribution for a write, taken from the signed-in account.
 *
 * Previously this built a GitHub `noreply` address from the OAuth login,
 * because the CMS never held a real email. Local accounts are keyed BY email,
 * so the honest attribution is the account itself.
 */
export function commitAuthor(user: {
  userId: number;
  email: string;
  name: string;
}): { id: number; name: string } {
  return { id: user.userId, name: user.name || user.email };
}
