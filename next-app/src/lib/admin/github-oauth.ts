import type { AdminConfig } from "./config";
import { callbackUrl } from "./config";

/**
 * GitHub OAuth (authorization code flow) + org membership check.
 *
 * Scopes requested:
 *   read:org  — needed to read the caller's own org membership. Without it the
 *               membership endpoint 404s for private memberships and everyone
 *               is locked out.
 *   repo      — needed to commit content. `public_repo` would be narrower, but
 *               it cannot write to a private repository, and this repo's
 *               visibility is not something the CMS should assume.
 */
const SCOPES = "read:org repo";

const GITHUB_AUTHORIZE = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN = "https://github.com/login/oauth/access_token";

export function authorizeUrl(config: AdminConfig, state: string): string {
  const params = new URLSearchParams({
    client_id: config.githubClientId,
    redirect_uri: callbackUrl(config.siteUrl),
    scope: SCOPES,
    state,
    allow_signup: "false",
  });
  return `${GITHUB_AUTHORIZE}?${params.toString()}`;
}

export type OAuthOutcome =
  | { ok: true; accessToken: string }
  | { ok: false; reason: string };

export async function exchangeCodeForToken(
  config: AdminConfig,
  code: string,
): Promise<OAuthOutcome> {
  let response: Response;
  try {
    response = await fetch(GITHUB_TOKEN, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: config.githubClientId,
        client_secret: config.githubClientSecret,
        code,
        redirect_uri: callbackUrl(config.siteUrl),
      }),
      cache: "no-store",
    });
  } catch {
    return { ok: false, reason: "network" };
  }

  if (!response.ok) return { ok: false, reason: "token_exchange_failed" };

  const data = (await response.json()) as {
    access_token?: string;
    error?: string;
  };
  if (!data.access_token) {
    // GitHub returns 200 with an `error` field on a bad/expired code.
    return { ok: false, reason: data.error ?? "no_access_token" };
  }
  return { ok: true, accessToken: data.access_token };
}

export interface GitHubUser {
  login: string;
  name: string;
  avatarUrl: string;
}

async function api(
  path: string,
  accessToken: string,
  apiUrl: string,
): Promise<Response | null> {
  try {
    return await fetch(`${apiUrl}${path}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    });
  } catch {
    return null;
  }
}

export async function fetchUser(
  accessToken: string,
  apiUrl: string,
): Promise<GitHubUser | null> {
  const res = await api("/user", accessToken, apiUrl);
  if (!res || !res.ok) return null;
  const u = (await res.json()) as {
    login?: string;
    name?: string | null;
    avatar_url?: string;
  };
  if (!u.login) return null;
  return {
    login: u.login,
    name: u.name || u.login,
    avatarUrl: u.avatar_url ?? "",
  };
}

/**
 * Authoritative access check. Uses `/user/memberships/orgs/{org}`, which
 * reports the CALLER's own membership including private ones — unlike
 * `/orgs/{org}/members/{user}`, which only sees public membership and would
 * lock out anyone whose membership is private (GitHub's default).
 *
 * Only `state === "active"` passes: a pending invitation is not membership.
 */
export async function isOrgMember(
  accessToken: string,
  org: string,
  apiUrl: string,
): Promise<boolean> {
  const res = await api(
    `/user/memberships/orgs/${encodeURIComponent(org)}`,
    accessToken,
    apiUrl,
  );
  if (!res || !res.ok) return false;
  const membership = (await res.json()) as { state?: string };
  return membership.state === "active";
}
