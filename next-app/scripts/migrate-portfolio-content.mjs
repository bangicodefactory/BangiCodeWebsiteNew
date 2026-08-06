#!/usr/bin/env node
/*
 * One-shot migration: project data → content/portfolio/<slug>.json
 *
 * A project used to live in four places:
 *   1. src/app/[locale]/portfolio/projects.ts   slug, category, tags, date
 *   2. messages/{en,fr,ar}.json  Work.<key>{Name,Summary,Outcome}
 *   3. content/work/manifest.json               hero image
 *   4. content/work/en/*.mdx                    dead, nothing imports it
 *
 * The CMS cannot safely write (1) — it is TypeScript, and a bad write is a
 * broken build, not a bad page. (2) is a UI-string catalog guarded by
 * check-messages-parity; editorial prose does not belong in it. So each project
 * becomes ONE JSON file carrying all three locales, which the CMS can write and
 * delete atomically and Zod can validate before it is ever committed.
 *
 * Idempotent: re-running regenerates the same 12 files from the same sources.
 * Safe to delete once the migration has landed and been reviewed.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOCALES = ["en", "fr", "ar"];
const OUT_DIR = path.join(ROOT, "content", "portfolio");

/*
 * Mirrors PROJECTS in projects.ts, in its existing display order. `key` is the
 * message-catalog prefix and is deliberately NOT carried into the output — after
 * this migration the copy lives in the file, so the indirection disappears.
 */
const PROJECTS = [
  {
    slug: "rentcar",
    key: "rentcar",
    category: "software",
    tags: ["Laravel", "Next.js", "Stripe", "PostgreSQL"],
    date: "2023",
  },
  {
    slug: "friterie-ma",
    key: "friterieMa",
    category: "software",
    tags: ["React", "Node.js", "MongoDB"],
    date: "2022–2023",
  },
  {
    slug: "classkom",
    key: "classkom",
    category: "software",
    tags: ["React Native", "Firebase", "Node.js"],
    date: "2023",
  },
  {
    slug: "nortecoffeeco",
    key: "nortecoffeeco",
    category: "software",
    tags: ["Next.js", "Sanity", "Stripe"],
    date: "2024",
  },
  {
    slug: "ayaalmadina",
    key: "ayaalmadina",
    category: "software",
    tags: ["Laravel", "MySQL", "Mapbox"],
    date: "2022",
  },
  {
    slug: "coinluminaire",
    key: "coinluminaire",
    category: "ecommerce",
    tags: ["Shopify", "Liquid"],
    date: "2023",
  },
  {
    slug: "cafeimperial",
    key: "cafeimperial",
    category: "web",
    tags: ["React", "Node.js"],
    date: "2024",
  },
  {
    slug: "aqarchamal",
    key: "aqarchamal",
    category: "web",
    tags: ["Laravel", "Bootstrap", "MongoDB"],
    date: "2023–2024",
  },
  {
    slug: "fujiwara",
    key: "fujiwara",
    category: "social",
    tags: ["Instagram", "Video", "Photography"],
    date: "2023–present",
  },
  {
    slug: "alaturco",
    key: "alaturco",
    category: "social",
    tags: ["Instagram", "Photography"],
    date: "2022–2023",
  },
  {
    slug: "riha-ma",
    key: "rihaMa",
    category: "social",
    tags: ["TikTok", "Reels"],
    date: "2023–2024",
  },
  {
    slug: "cosas-buenas",
    key: "cosasbuenas",
    category: "social",
    tags: ["Instagram", "Content"],
    date: "2024–present",
  },
];

const catalogs = Object.fromEntries(
  LOCALES.map((l) => [
    l,
    JSON.parse(readFileSync(path.join(ROOT, "messages", `${l}.json`), "utf8")),
  ]),
);

const manifest = JSON.parse(
  readFileSync(path.join(ROOT, "content", "work", "manifest.json"), "utf8"),
);
const heroBySlug = new Map(manifest.cases.map((c) => [c.slug, c.hero]));

mkdirSync(OUT_DIR, { recursive: true });

let written = 0;
const missing = [];

for (const [i, p] of PROJECTS.entries()) {
  const content = {};
  for (const locale of LOCALES) {
    const work = catalogs[locale].Work;
    const name = work[`${p.key}Name`];
    const summary = work[`${p.key}Summary`];
    const outcome = work[`${p.key}Outcome`];
    for (const [field, value] of Object.entries({ name, summary, outcome })) {
      if (typeof value !== "string" || value.trim() === "") {
        missing.push(
          `${locale}: Work.${p.key}${field[0].toUpperCase()}${field.slice(1)}`,
        );
      }
    }
    content[locale] = { name, summary, outcome };
  }

  const hero = heroBySlug.get(p.slug);
  if (!hero) missing.push(`manifest: no hero entry for ${p.slug}`);

  const project = {
    slug: p.slug,
    // Explicit order: a directory of files has none, and the existing list is
    // grouped by practice rather than sorted by date. The CMS reorders by
    // rewriting this field.
    order: i + 1,
    category: p.category,
    tags: p.tags,
    date: p.date,
    /*
     * Shared, not per-locale. Every hero is still `placeholder: true`, and the
     * placeholder branch renders the project name instead — so this alt text is
     * currently inert. It needs to become per-locale when real screenshots land.
     */
    hero,
    content,
  };

  writeFileSync(
    path.join(OUT_DIR, `${p.slug}.json`),
    JSON.stringify(project, null, 2) + "\n",
    "utf8",
  );
  written++;
}

if (missing.length) {
  console.error("migrate-portfolio-content: FAILED — missing source data\n");
  for (const m of missing) console.error("  " + m);
  process.exit(1);
}

console.log(
  `migrate-portfolio-content: wrote ${written} project files to content/portfolio/ ` +
    `(${written * LOCALES.length * 3} strings carried over, none invented)`,
);

if (!existsSync(path.join(OUT_DIR, "rentcar.json"))) {
  console.error("sanity check failed: rentcar.json not written");
  process.exit(1);
}
