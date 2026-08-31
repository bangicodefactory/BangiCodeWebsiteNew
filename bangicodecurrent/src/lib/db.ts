import mysql from "mysql2/promise";

/**
 * The MySQL/MariaDB connection pool. See ADR 0003.
 *
 * `mysql2` rather than an ORM with a native query engine: Prisma ships a
 * platform-specific binary, which is the same class of dependency that made
 * `@mdx-js/mdx` resolvable on a developer machine and missing in CI. This is
 * pure JavaScript and traces cleanly into the standalone bundle.
 *
 * SQL is written by hand in the loaders (`lib/portfolio.ts`, `lib/blog.ts`)
 * and in `lib/admin/content.ts`, the same way the GitHub client it replaced
 * spoke to that API directly rather than pulling in Octokit.
 */

export interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export type DbConfigResult =
  | { ok: true; config: DbConfig }
  | { ok: false; missing: string[] };

/**
 * Read lazily and WITHOUT throwing, exactly like loadAdminConfig. The public
 * marketing pages must not fall over because the CMS database is unconfigured,
 * and CI builds the site with no database at all.
 */
export function loadDbConfig(): DbConfigResult {
  const env = process.env;
  const missing: string[] = [];

  function need(name: string): string {
    const v = env[name]?.trim();
    if (!v) missing.push(name);
    return v ?? "";
  }

  const host = need("DB_HOST");
  const user = need("DB_USER");
  const database = need("DB_NAME");
  // A password is genuinely optional — local XAMPP/MariaDB runs without one.
  const password = env.DB_PASSWORD ?? "";
  const port = Number(env.DB_PORT ?? 3306);

  if (missing.length > 0) return { ok: false, missing };
  return { ok: true, config: { host, port, user, password, database } };
}

/*
 * The pool is cached on globalThis.
 *
 * Two reasons. In dev, every hot reload re-evaluates this module, and a fresh
 * pool per reload leaks connections until the server refuses new ones. In
 * production under Passenger, each process gets its own pool — which is the
 * reason connectionLimit is small: shared hosting caps concurrent connections
 * per account, and several Passenger workers each holding ten would exhaust it.
 */
const globalForDb = globalThis as unknown as {
  __bangicodePool?: mysql.Pool;
};

export function getPool(): mysql.Pool {
  if (globalForDb.__bangicodePool) return globalForDb.__bangicodePool;

  const result = loadDbConfig();
  if (!result.ok) {
    throw new Error(
      `Database is not configured — missing ${result.missing.join(", ")}. See bangicodecurrent/.env.example.`,
    );
  }

  const pool = mysql.createPool({
    ...result.config,
    waitForConnections: true,
    connectionLimit: 3,
    maxIdle: 3,
    idleTimeout: 60_000,
    charset: "utf8mb4_unicode_ci",
    // Dates come back as strings; the app treats them as calendar days, not
    // instants, and letting the driver build Date objects reintroduces exactly
    // the timezone shift that made blog dates land a day early.
    dateStrings: true,
    // Kills a whole class of injection: placeholders can never become SQL.
    multipleStatements: false,
  });

  globalForDb.__bangicodePool = pool;
  return pool;
}

/**
 * What may be bound to a `?`. Narrower than `unknown[]` on purpose: an object
 * or an array reaching a placeholder is a bug at the call site, and the type
 * error is a cheaper place to find it than a driver exception at runtime.
 */
export type SqlValue = string | number | boolean | null | Date | Buffer;

/** Typed helper for SELECTs. Always use `?` placeholders, never interpolation. */
export async function query<T>(
  sql: string,
  params: SqlValue[] = [],
): Promise<T[]> {
  const [rows] = await getPool().execute(sql, params);
  return rows as T[];
}

/** For INSERT/UPDATE/DELETE where only the result metadata matters. */
export async function execute(
  sql: string,
  params: SqlValue[] = [],
): Promise<mysql.ResultSetHeader> {
  const [result] = await getPool().execute(sql, params);
  return result as mysql.ResultSetHeader;
}

/**
 * Runs `fn` inside a transaction, rolling back on any throw.
 *
 * This is the guarantee ADR 0002 chose the Git Data API for — every locale of a
 * post lands together or not at all — now enforced by the database instead of
 * by building a git tree. A half-published post renders in one language and
 * 404s in another, so partial success is not a lesser success.
 */
export async function withTransaction<T>(
  fn: (conn: mysql.PoolConnection) => Promise<T>,
): Promise<T> {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const value = await fn(conn);
    await conn.commit();
    return value;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

/** MySQL/MariaDB duplicate-key error, used to turn a race into a field error. */
export function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "ER_DUP_ENTRY"
  );
}

/** The constraint name a duplicate-key error names, so callers can tell which. */
export function duplicateKeyName(error: unknown): string | null {
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message?: string }).message)
      : "";
  // "Duplicate entry 'x' for key 'projects.sort_order'"
  const match = message.match(/for key '(?:[^.']+\.)?([^']+)'/);
  return match?.[1] ?? null;
}
