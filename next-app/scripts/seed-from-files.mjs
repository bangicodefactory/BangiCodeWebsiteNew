#!/usr/bin/env node
/**
 * Loads the repository's content files into the database. See ADR 0003.
 *
 * The files under `content/portfolio/` and `content/blog/` stopped being the
 * source of truth when content moved to MySQL, but they were NOT deleted: they
 * are the seed fixture. CI needs deterministic content to assert against
 * (`/en/portfolio/rentcar` appears in both routes.spec.ts and
 * .lighthouserc.json), and a developer needs a way to get a working database
 * without asking someone for a dump of production.
 *
 *   pnpm db:seed              # insert what is missing, leave the rest alone
 *   pnpm db:seed --reset      # delete all content first
 *
 * Idempotent by default, so running it twice is safe. --reset exists for tests,
 * which need to start from a known state; it refuses to run unless the database
 * name looks like a development or test one, because a seed script that can
 * empty production is a loaded gun left on the table.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import matter from "gray-matter";

const HERE = dirname(fileURLToPath(import.meta.url));
const CONTENT = join(HERE, "..", "content");
const LOCALES = ["en", "fr", "ar"];

function connectionConfig() {
  const missing = ["DB_HOST", "DB_USER", "DB_NAME"].filter(
    (n) => !process.env[n]?.trim(),
  );
  if (missing.length > 0) {
    console.error(`seed: missing ${missing.join(", ")}.`);
    process.exit(1);
  }
  return {
    host: process.env.DB_HOST.trim(),
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER.trim(),
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME.trim(),
    charset: "utf8mb4_unicode_ci",
  };
}

async function seedProjects(conn, reset) {
  const dir = join(CONTENT, "portfolio");
  if (!existsSync(dir)) return 0;

  let count = 0;
  for (const file of readdirSync(dir).sort()) {
    if (!file.endsWith(".json")) continue;
    const project = JSON.parse(readFileSync(join(dir, file), "utf8"));

    const [existing] = await conn.execute(
      "SELECT id FROM projects WHERE slug = ? LIMIT 1",
      [project.slug],
    );
    if (existing[0] && !reset) continue;

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

    for (const locale of LOCALES) {
      const c = project.content[locale];
      if (!c) continue;
      await conn.execute(
        `INSERT INTO project_translations (project_id, locale, name, summary, outcome)
         VALUES (?, ?, ?, ?, ?)`,
        [result.insertId, locale, c.name, c.summary, c.outcome],
      );
    }
    count++;
  }
  return count;
}

async function seedPosts(conn, reset) {
  // Posts are one file per locale, so collect by slug across all three first.
  const bySlug = new Map();
  for (const locale of LOCALES) {
    const dir = join(CONTENT, "blog", locale);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir).sort()) {
      if (!file.endsWith(".mdx")) continue;
      const slug = file.replace(/\.mdx$/, "");
      const { data, content } = matter(readFileSync(join(dir, file), "utf8"));
      const entry = bySlug.get(slug) ?? { slug, date: null, locales: {} };
      entry.locales[locale] = {
        title: typeof data.title === "string" ? data.title : slug,
        description:
          typeof data.description === "string" ? data.description : "",
        body: content.trim(),
      };
      entry.date ??= normaliseDate(data.date);
      bySlug.set(slug, entry);
    }
  }

  let count = 0;
  for (const entry of bySlug.values()) {
    const [existing] = await conn.execute(
      "SELECT id FROM posts WHERE slug = ? LIMIT 1",
      [entry.slug],
    );
    if (existing[0] && !reset) continue;

    const [result] = await conn.execute(
      "INSERT INTO posts (slug, date) VALUES (?, ?)",
      [entry.slug, entry.date ?? "2026-01-01"],
    );
    for (const [locale, c] of Object.entries(entry.locales)) {
      await conn.execute(
        `INSERT INTO post_translations (post_id, locale, title, description, body)
         VALUES (?, ?, ?, ?, ?)`,
        [result.insertId, locale, c.title, c.description, c.body],
      );
    }
    count++;
  }
  return count;
}

function normaliseDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  return null;
}

async function main() {
  const reset = process.argv.includes("--reset");
  const config = connectionConfig();

  if (reset && !/(_dev|_test|test_|^test$)/i.test(config.database)) {
    console.error(
      `seed: refusing --reset on "${config.database}" — the name does not look like a dev or test database.`,
    );
    console.error(
      "Rename the database, or delete the rows by hand if you really mean it.",
    );
    process.exit(1);
  }

  const conn = await mysql.createConnection(config);
  try {
    if (reset) {
      // Translations cascade; content_revisions is deliberately kept, since
      // its whole purpose is to outlive the thing it describes.
      await conn.execute("DELETE FROM posts");
      await conn.execute("DELETE FROM projects");
      console.log("seed: cleared existing content");
    }

    const projects = await seedProjects(conn, reset);
    const posts = await seedPosts(conn, reset);
    console.log(`seed: ${projects} project(s), ${posts} post(s).`);
  } finally {
    await conn.end();
  }
}

main().catch((error) => {
  console.error("seed:", error.message);
  process.exit(1);
});
