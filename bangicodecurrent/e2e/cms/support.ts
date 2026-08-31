import { test as base, expect, type Page } from "@playwright/test";
import mysql, { type Connection } from "mysql2/promise";

/**
 * Shared setup for the CMS suite: a signed-in session and a known database.
 *
 * The session cookie is sealed here with the SAME algorithm as
 * src/lib/admin/crypto.ts rather than imported from it. Re-implementing means a
 * green test proves the cookie FORMAT is what the server expects, not merely
 * that the code agrees with itself — if either side drifts, these fail.
 *
 * Assertions read the database directly. The old suite asserted against a stub
 * GitHub's commit log; the equivalent question now is "what rows exist", and
 * asking the engine is both simpler and stricter — a transaction that rolled
 * back leaves nothing to find.
 */

const SECRET = "playwright-cms-suite-secret-at-least-32-characters-long";

const DB_CONFIG = {
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.CMS_TEST_DB ?? "bangicode_test",
  dateStrings: true as const,
};

function b64url(bytes: Uint8Array): string {
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function sealSession(expiresInSeconds = 3600): Promise<string> {
  // Identity only — the session carries no credential of any kind.
  const payload = {
    userId: 1,
    email: "ahmed@bangicode.test",
    name: "Ahmed Chioua",
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(SECRET),
  );
  const key = await crypto.subtle.importKey(
    "raw",
    digest,
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(JSON.stringify(payload)),
    ),
  );
  const combined = new Uint8Array(iv.length + ciphertext.length);
  combined.set(iv, 0);
  combined.set(ciphertext, iv.length);
  return b64url(combined);
}

export async function db(): Promise<Connection> {
  return mysql.createConnection(DB_CONFIG);
}

/** Every row of a table, for assertions. */
export async function rows<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const conn = await db();
  try {
    const [result] = await conn.query(sql, params);
    return result as T[];
  } finally {
    await conn.end();
  }
}

export interface Revision {
  entity_type: string;
  entity_slug: string;
  action: string;
  snapshot: string | null;
  author_name: string;
}

/** What the CMS recorded that it did — the replacement for the commit log. */
export async function getRevisions(): Promise<Revision[]> {
  return rows<Revision>(
    "SELECT entity_type, entity_slug, action, snapshot, author_name FROM content_revisions ORDER BY id ASC",
  );
}

/**
 * A known starting point: one post in all three locales, one project.
 *
 * Deliberately the same fixture the stub-GitHub suite used, so the properties
 * under test did not quietly change along with the storage.
 */
async function resetContent(): Promise<void> {
  const conn = await db();
  try {
    // Translations cascade. Revisions are cleared too — unlike production,
    // where they must outlive what they describe, a test needs a clean slate.
    await conn.query("DELETE FROM posts");
    await conn.query("DELETE FROM projects");
    await conn.query("DELETE FROM content_revisions");

    const [post] = await conn.query(
      "INSERT INTO posts (slug, date) VALUES ('seeded-post', '2026-08-01')",
    );
    const postId = (post as { insertId: number }).insertId;
    for (const locale of ["en", "fr", "ar"]) {
      await conn.query(
        "INSERT INTO post_translations (post_id, locale, title, description, body) VALUES (?, ?, ?, ?, ?)",
        [
          postId,
          locale,
          `Seeded (${locale})`,
          "A post that already exists",
          "Seeded body.",
        ],
      );
    }

    const [project] = await conn.query(
      `INSERT INTO projects
         (slug, sort_order, category, date, tags,
          hero_placeholder, hero_webp, hero_alt, hero_width, hero_height)
       VALUES ('rentcar', 1, 'software', '2023', '["Laravel","Next.js"]',
               1, '/case-studies/rentcar/hero.webp', 'RentCar', 1600, 900)`,
    );
    const projectId = (project as { insertId: number }).insertId;
    const translations: Array<[string, string, string, string]> = [
      ["en", "RentCar", "EN summary.", "EN outcome."],
      ["fr", "RentCar", "FR résumé.", "FR résultat."],
      ["ar", "RentCar", "ملخص.", "نتيجة."],
    ];
    for (const [locale, name, summary, outcome] of translations) {
      await conn.query(
        "INSERT INTO project_translations (project_id, locale, name, summary, outcome) VALUES (?, ?, ?, ?, ?)",
        [projectId, locale, name, summary, outcome],
      );
    }
  } finally {
    await conn.end();
  }
}

/** Signs the browser in and starts every test from a known database. */
export const test = base.extend<{ signedIn: Page }>({
  signedIn: async ({ page, context }, use) => {
    await resetContent();
    await context.addCookies([
      {
        name: "bangicode_admin",
        value: await sealSession(),
        domain: "localhost",
        path: "/admin",
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
    await use(page);
  },
});

export { expect };
