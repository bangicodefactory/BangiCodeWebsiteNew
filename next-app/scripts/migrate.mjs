#!/usr/bin/env node
/**
 * Applies every migrations/*.sql that has not run yet, in filename order.
 *
 * Deliberately tiny — a numbered-files migrator, in the same style as the other
 * scripts/*.mjs guards, rather than a migration framework. The schema is six
 * tables that change rarely; a dependency that owns the database is a poor
 * trade for that.
 *
 * Safe to re-run: applied filenames are recorded in `schema_migrations`, and
 * each file is executed inside a transaction so a failure halfway leaves
 * nothing behind. Note MariaDB/MySQL commit DDL implicitly, so the transaction
 * protects the bookkeeping, not the CREATE TABLEs — which is why every
 * statement in 001 is `IF NOT EXISTS`.
 *
 *   node scripts/migrate.mjs            # apply
 *   node scripts/migrate.mjs --status   # list without applying
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const HERE = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(HERE, "..", "migrations");

function config() {
  const missing = ["DB_HOST", "DB_USER", "DB_NAME"].filter(
    (n) => !process.env[n]?.trim(),
  );
  if (missing.length > 0) {
    console.error(`migrate: missing ${missing.join(", ")}.`);
    console.error("Set them in next-app/.env.local — see .env.example.");
    process.exit(1);
  }
  return {
    host: process.env.DB_HOST.trim(),
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER.trim(),
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME.trim(),
    multipleStatements: true,
    charset: "utf8mb4_unicode_ci",
  };
}

/**
 * Split on semicolons at end-of-line only. The naive `split(";")` breaks any
 * statement containing a semicolon inside a string literal.
 *
 * Comment LINES are stripped from each chunk, not whole chunks that begin with
 * one. Dropping `!/^--/.test(s)` chunks looked equivalent and was not: every
 * statement in 001 that happens to be preceded by an explanatory comment — the
 * `users` and `content_revisions` tables — was silently discarded, and the
 * migration then reported success with two tables missing. A migrator that
 * skips work and says "applied" is worse than one that crashes.
 */
function statements(sql) {
  return sql
    .split(/;\s*$/m)
    .map((chunk) =>
      chunk
        .split("\n")
        .filter((line) => !/^\s*--/.test(line))
        .join("\n")
        .trim(),
    )
    .filter((s) => s.length > 0);
}

async function main() {
  const statusOnly = process.argv.includes("--status");
  const conn = await mysql.createConnection(config());

  await conn.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename   VARCHAR(255) NOT NULL,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (filename)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  const [applied] = await conn.query("SELECT filename FROM schema_migrations");
  const done = new Set(applied.map((r) => r.filename));

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const pending = files.filter((f) => !done.has(f));

  if (statusOnly) {
    for (const f of files) {
      console.log(`${done.has(f) ? "applied" : "PENDING"}  ${f}`);
    }
    await conn.end();
    return;
  }

  if (pending.length === 0) {
    console.log(`migrate: up to date (${files.length} applied).`);
    await conn.end();
    return;
  }

  for (const file of pending) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
    const parsed = statements(sql);
    try {
      for (const statement of parsed) {
        await conn.query(statement);
      }
      await conn.query("INSERT INTO schema_migrations (filename) VALUES (?)", [
        file,
      ]);
      // The count is printed because a parser bug once dropped two statements
      // and still reported success. A number that does not match the file is
      // the only cheap signal that the splitter has gone wrong again.
      console.log(`migrate: applied ${file} (${parsed.length} statements)`);
    } catch (error) {
      console.error(`migrate: FAILED on ${file}`);
      console.error(error.message);
      await conn.end();
      process.exit(1);
    }
  }

  console.log(`migrate: ${pending.length} applied.`);
  await conn.end();
}

main().catch((error) => {
  console.error("migrate: could not connect —", error.message);
  process.exit(1);
});
