/**
 * Admin/CMS configuration, read from the environment.
 *
 * Deliberately LAZY and non-throwing at module load. CI builds the site without
 * any of these secrets, and the public site must not depend on the CMS being
 * configured — so a missing variable produces a diagnostic that /admin renders
 * as setup instructions, never a crashed build or a 500 on the marketing site.
 */

export interface AdminConfig {
  githubClientId: string;
  githubClientSecret: string;
  /** Only members of this GitHub org may sign in. */
  githubOrg: string;
  /** "owner/name" of the repo content is committed to. */
  githubRepo: string;
  /** Branch commits land on. */
  githubBranch: string;
  /**
   * Server-side credential used to WRITE content. Never sent to the browser and
   * never stored in a cookie — see the note in github-oauth.ts.
   */
  githubToken: string;
  /** ≥32 chars. Derives the AES-GCM key that seals the session cookie. */
  sessionSecret: string;
  /** Absolute origin, used to build the OAuth callback URL. */
  siteUrl: string;
  /**
   * GitHub REST base. Overridable for GitHub Enterprise, and so the CMS can be
   * driven against a stub in tests without touching the real API.
   */
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

  const githubClientId = need("GITHUB_CLIENT_ID");
  const githubClientSecret = need("GITHUB_CLIENT_SECRET");
  const sessionSecret = need("ADMIN_SESSION_SECRET");
  const githubRepo = need("GITHUB_REPO");
  const githubToken = need("GITHUB_TOKEN");

  const githubOrg = env.GITHUB_ORG?.trim() || "bangicodefactory";
  const githubBranch = env.GITHUB_BRANCH?.trim() || "main";
  const siteUrl = env.SITE_URL?.trim() || "https://bangicode.ma";
  const githubApiUrl = (
    env.GITHUB_API_URL?.trim() || "https://api.github.com"
  ).replace(/\/$/, "");

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
  if (githubRepo && !/^[\w.-]+\/[\w.-]+$/.test(githubRepo)) {
    problems.push(`GITHUB_REPO must be "owner/name" (got "${githubRepo}")`);
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
      githubClientId,
      githubClientSecret,
      githubOrg,
      githubRepo,
      githubBranch,
      sessionSecret,
      siteUrl,
      githubApiUrl,
      githubToken,
    },
  };
}

/**
 * Middleware only needs the secret, and must not fail when the CMS is
 * unconfigured — it lets the request through so /admin can explain itself.
 */
export function sessionSecretOrNull(): string | null {
  const s = process.env.ADMIN_SESSION_SECRET?.trim();
  return s && s.length >= MIN_SECRET_LENGTH ? s : null;
}

export function callbackUrl(siteUrl: string): string {
  return `${siteUrl.replace(/\/$/, "")}/admin/auth/callback`;
}
