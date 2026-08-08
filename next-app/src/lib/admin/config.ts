/**
 * Admin/CMS configuration, read from the environment. See ADR 0003.
 *
 * Deliberately LAZY and non-throwing at module load. CI builds the site without
 * any of these secrets, and the public site must not depend on the CMS being
 * configured — so a missing variable produces a diagnostic that /admin renders
 * as setup instructions, never a crashed build or a 500 on the marketing site.
 */

export interface AdminConfig {
  /** Seals the session cookie (AES-256-GCM). ≥32 chars. */
  sessionSecret: string;
  /** Absolute origin. Must be https in production — the cookie is Secure. */
  siteUrl: string;

  /*
   * TRANSITIONAL — removed in the phase that moves content off GitHub.
   * `src/lib/admin/content.ts` still commits through the GitHub API; these keep
   * it compiling and working until it reads from the database instead. They are
   * NOT required: an install with no GitHub credentials is a valid, fully
   * configured install as far as sign-in is concerned.
   */
  githubRepo: string;
  githubBranch: string;
  githubToken: string;
  githubApiUrl: string;
}

export type ConfigResult =
  | { ok: true; config: AdminConfig }
  | { ok: false; missing: string[]; problems: string[] };

const MIN_SECRET_LENGTH = 32;

function countDistinct(value: string): number {
  return new Set(value).size;
}

export function loadAdminConfig(): ConfigResult {
  const env = process.env;
  const missing: string[] = [];
  const problems: string[] = [];

  function need(name: string): string {
    const v = env[name];
    if (!v || v.trim() === "") {
      missing.push(name);
      return "";
    }
    return v.trim();
  }

  const sessionSecret = need("ADMIN_SESSION_SECRET");

  // The database is required for sign-in: accounts live in it. Named
  // individually so /admin/login can say which one is missing.
  need("DB_HOST");
  need("DB_USER");
  need("DB_NAME");

  const siteUrl = env.SITE_URL?.trim() || "https://bangicode.ma";

  if (sessionSecret && sessionSecret.length < MIN_SECRET_LENGTH) {
    problems.push(
      `ADMIN_SESSION_SECRET must be at least ${MIN_SECRET_LENGTH} characters (got ${sessionSecret.length}). Generate one with: openssl rand -base64 48`,
    );
  } else if (sessionSecret && countDistinct(sessionSecret) < 12) {
    /*
     * Length alone is a weak gate: "aaaa…" passes it. The secret is hashed
     * straight to an AES key with no KDF stretching, which is fine for the
     * random value the docs tell you to generate and poor for a passphrase.
     * This catches the obviously-typed-by-hand case.
     */
    problems.push(
      `ADMIN_SESSION_SECRET looks low-entropy (${countDistinct(sessionSecret)} distinct characters). Generate one with: openssl rand -base64 48`,
    );
  }
  if (siteUrl && !/^https?:\/\//.test(siteUrl)) {
    problems.push(`SITE_URL must be an absolute origin (got "${siteUrl}")`);
  }

  if (missing.length > 0 || problems.length > 0) {
    return { ok: false, missing, problems };
  }

  return {
    ok: true,
    config: {
      sessionSecret,
      siteUrl,
      githubRepo: env.GITHUB_REPO?.trim() ?? "",
      githubBranch: env.GITHUB_BRANCH?.trim() || "main",
      githubToken: env.GITHUB_TOKEN?.trim() ?? "",
      githubApiUrl: (
        env.GITHUB_API_URL?.trim() || "https://api.github.com"
      ).replace(/\/$/, ""),
    },
  };
}

/**
 * Middleware only needs the secret. Returning null means "the CMS is not
 * configured", and the middleware treats that as DENY, not allow: no session
 * can exist without a secret to seal it, so letting the request through was an
 * open admin. /admin/login is public and still explains what to set.
 */
export function sessionSecretOrNull(): string | null {
  const s = process.env.ADMIN_SESSION_SECRET?.trim();
  return s && s.length >= MIN_SECRET_LENGTH ? s : null;
}
