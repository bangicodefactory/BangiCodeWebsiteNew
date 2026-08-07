import { unstable_cache } from "next/cache";
import { query } from "./db";
import { projectSchema, type Project } from "./portfolio-schema";

/**
 * Portfolio projects, read from the database. See ADR 0003.
 *
 * SERVER ONLY — it opens a database connection. The contract (schema, types,
 * categories) lives in portfolio-schema.ts so the admin's client-side editor
 * can share it without dragging a MySQL driver into the browser bundle.
 * Importing THIS module from a client component fails the build with a
 * Turbopack chunk error that does not name the cause, so keep the split.
 *
 * Each project carries ALL THREE locales, because a project cannot publish
 * without them (a locked decision). That is enforced by the schema rather than
 * by check-messages-parity: the parity guard covers UI chrome only, which is
 * what it is actually good at.
 *
 * Rows are validated with the SAME Zod schema the CMS writes against, so a bad
 * row is caught exactly where a bad file used to be. What changed is the
 * response: the file loader THREW, because a malformed file meant someone had
 * hand-edited the repo and the build should stop. A malformed row cannot get
 * past the admin's validation, so the likelier cause here is a schema change
 * mid-deploy — and taking the whole portfolio page down for one bad row is a
 * worse outcome than rendering the rest. Bad rows are skipped and logged.
 */

export {
  PROJECT_CATEGORIES,
  projectSchema,
  toCardData,
  type Project,
  type ProjectCategory,
  type ProjectCardData,
  type ProjectLocaleContent,
} from "./portfolio-schema";

/** Invalidated by the admin on publish — see revalidateTag in actions.ts. */
export const PROJECTS_TAG = "projects";

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

interface TranslationRow {
  project_id: number;
  locale: string;
  name: string;
  summary: string;
  outcome: string;
}

function parseTags(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((t) => typeof t === "string")
      : [];
  } catch {
    return [];
  }
}

/**
 * Two queries, not one per project.
 *
 * The obvious shape — fetch projects, then translations for each — is N+1, and
 * on shared hosting with a connection limit of three that is the difference
 * between one round trip and thirteen for a page that renders in 12ms.
 */
async function readAll(): Promise<Project[]> {
  const rows = await query<ProjectRow>(
    `SELECT id, slug, sort_order, category, date, tags,
            hero_placeholder, hero_webp, hero_alt, hero_width, hero_height
       FROM projects
       ORDER BY sort_order ASC`,
  );
  if (rows.length === 0) return [];

  const translations = await query<TranslationRow>(
    "SELECT project_id, locale, name, summary, outcome FROM project_translations",
  );

  const byProject = new Map<number, Record<string, unknown>>();
  for (const t of translations) {
    const bucket = byProject.get(t.project_id) ?? {};
    bucket[t.locale] = {
      name: t.name,
      summary: t.summary,
      outcome: t.outcome,
    };
    byProject.set(t.project_id, bucket);
  }

  const projects: Project[] = [];
  for (const row of rows) {
    const candidate = {
      slug: row.slug,
      order: row.sort_order,
      category: row.category,
      tags: parseTags(row.tags),
      date: row.date,
      hero: {
        placeholder: Boolean(row.hero_placeholder),
        webp: row.hero_webp,
        alt: row.hero_alt,
        width: row.hero_width,
        height: row.hero_height,
      },
      content: byProject.get(row.id) ?? {},
    };

    const result = projectSchema.safeParse(candidate);
    if (result.success) {
      projects.push(result.data);
    } else {
      // Loud in the server log, invisible to the visitor. The admin's project
      // list surfaces the same problem where someone can act on it.
      console.error(
        `portfolio: skipping "${row.slug}" — ${result.error.issues
          .map((i) => `${i.path.join(".")} ${i.message}`)
          .join("; ")}`,
      );
    }
  }

  return projects;
}

/*
 * Cached with a tag rather than a time.
 *
 * Content changes when someone publishes and at no other moment, so an
 * expiry-based cache is a choice between stale pages and pointless queries.
 * `revalidateTag(PROJECTS_TAG)` in the publish action makes the change live in
 * seconds while every other request is served from cache — which is what keeps
 * the CI-enforced perf budget intact now that these routes no longer prerender
 * at build time.
 *
 * Deliberately `unstable_cache` and not the `use cache` directive that
 * supersedes it in Next 16: `use cache` requires enabling Cache Components
 * globally, which changes how every dynamic API behaves across all 105
 * prerendered pages. That migration belongs on its own. See ADR 0003.
 */
const cachedProjects = unstable_cache(readAll, ["portfolio-projects"], {
  tags: [PROJECTS_TAG],
});

export async function getProjects(): Promise<Project[]> {
  return cachedProjects();
}

export async function getProject(slug: string): Promise<Project | null> {
  const projects = await cachedProjects();
  return projects.find((p) => p.slug === slug) ?? null;
}

export async function getProjectSlugs(): Promise<string[]> {
  const projects = await cachedProjects();
  return projects.map((p) => p.slug);
}
