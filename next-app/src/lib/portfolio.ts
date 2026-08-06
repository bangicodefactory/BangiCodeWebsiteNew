import fs from "node:fs";
import path from "node:path";
import { projectSchema, type Project } from "./portfolio-schema";

/**
 * Portfolio projects, one JSON file per project under `content/portfolio/`.
 *
 * SERVER ONLY — it reads the filesystem. The contract (schema, types,
 * categories) lives in portfolio-schema.ts so the admin's client-side editor
 * can share it without dragging `node:fs` into the browser bundle. Importing
 * THIS module from a client component fails the build with a Turbopack chunk
 * error that does not name the cause, so keep the split.
 *
 * (The `server-only` package would turn that into a clear message. It is not
 * installed, and adding it with npm would desync pnpm-lock.yaml, which CI
 * installs with --frozen-lockfile. Worth adding via pnpm separately.)
 *
 * Each file carries ALL THREE locales, because a project cannot publish without
 * them (a locked decision). That is enforced by the schema rather than by
 * check-messages-parity: the parity guard now covers UI chrome only, which is
 * what it is actually good at.
 *
 * The same schema is what the CMS validates against before committing, so a
 * malformed write is rejected at the admin boundary and never reaches the repo.
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

const CONTENT_DIR = path.join(process.cwd(), "content", "portfolio");

function readAll(): Project[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const projects: Project[] = [];
  const errors: string[] = [];

  for (const file of fs.readdirSync(CONTENT_DIR).sort()) {
    if (!file.endsWith(".json")) continue;
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      errors.push(`${file}: not valid JSON`);
      continue;
    }

    const result = projectSchema.safeParse(parsed);
    if (!result.success) {
      errors.push(
        `${file}: ${result.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`,
      );
      continue;
    }
    if (result.data.slug !== file.replace(/\.json$/, "")) {
      errors.push(
        `${file}: slug "${result.data.slug}" does not match filename`,
      );
      continue;
    }
    projects.push(result.data);
  }

  /*
   * Duplicate `order` values sort unpredictably against each other, so the
   * portfolio would silently reorder between builds. The CMS defaults new
   * projects to max+1, but nothing stops a hand-edit colliding.
   */
  const seen = new Map<number, string>();
  for (const p of projects) {
    const other = seen.get(p.order);
    if (other) {
      errors.push(
        `${p.slug}.json: order ${p.order} is already used by ${other}.json — orders must be unique`,
      );
    } else {
      seen.set(p.order, p.slug);
    }
  }

  /*
   * Throw rather than skip. A project silently missing from the portfolio is
   * exactly the class of failure this project keeps getting bitten by — the
   * unstyled tokens, the dead Arabic font, the 500ing case studies. A broken
   * content file should fail the build, loudly, at the point of the mistake.
   */
  if (errors.length > 0) {
    throw new Error(
      `Invalid portfolio content:\n  ${errors.join("\n  ")}\n` +
        `Fix the file(s) under content/portfolio/.`,
    );
  }

  return projects.sort((a, b) => a.order - b.order);
}

export function getProjects(): Project[] {
  return readAll();
}

export function getProject(slug: string): Project | null {
  return readAll().find((p) => p.slug === slug) ?? null;
}

export function getProjectSlugs(): string[] {
  return readAll().map((p) => p.slug);
}
