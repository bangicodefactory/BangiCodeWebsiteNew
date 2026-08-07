import { cookies } from "next/headers";
import { seal, unseal } from "./crypto";

/**
 * Stateless admin sessions.
 *
 * The session carries IDENTITY ONLY — who is signed in, and until when. No
 * GitHub token. Writes use a server-side credential that never leaves the
 * server (see github-oauth.ts for why), so a stolen cookie grants access to
 * this admin UI and nothing else on GitHub.
 *
 * Still encrypted rather than merely signed: the payload is small, AES-GCM
 * gives integrity in the same primitive, and it keeps the login name out of
 * anything that can read the cookie jar.
 *
 * Stateless by design — no session store, so a Passenger respawn on shared
 * hosting does not sign everyone out.
 */

export const SESSION_COOKIE = "bangicode_admin";
export const STATE_COOKIE = "bangicode_admin_state";

/** 8 hours. Org membership is verified at sign-in, so a session should not
 *  outlive a working day — removing someone from the org shouldn't leave them
 *  publishing for a week. */
export const SESSION_TTL_SECONDS = 8 * 60 * 60;

export interface AdminSession {
  login: string;
  name: string;
  avatarUrl: string;
  /** Unix SECONDS. Checked on every read — a sealed cookie is not enough. */
  exp: number;
}

/** The subset safe to hand to a component. Deliberately excludes `exp`. */
export type AdminUser = Pick<AdminSession, "login" | "name" | "avatarUrl">;

export function toAdminUser(session: AdminSession): AdminUser {
  return {
    login: session.login,
    name: session.name,
    avatarUrl: session.avatarUrl,
  };
}

/**
 * Cookie scoped to /admin, so it is never attached to requests for the public
 * marketing pages. Smaller blast radius, and it keeps the token off every
 * image and font request.
 */
const COOKIE_BASE = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/admin",
  secure: process.env.NODE_ENV === "production",
};

export async function openSession(
  raw: string | undefined,
  secret: string,
): Promise<AdminSession | null> {
  const session = await unseal<AdminSession>(raw, secret);
  if (!session) return null;
  /*
   * Every field is checked, not just exp and login. AES-GCM means this cannot
   * be a forgery, but it can be an OLD shape — a cookie sealed by a previous
   * deploy whose AdminSession had different fields. Those ride through unseal
   * intact and surface as `undefined` in the UI. Rejecting the whole cookie
   * signs that person out once, which is the recoverable failure.
   */
  if (
    typeof session.exp !== "number" ||
    typeof session.login !== "string" ||
    typeof session.name !== "string" ||
    typeof session.avatarUrl !== "string"
  ) {
    return null;
  }
  if (session.exp * 1000 <= Date.now()) return null;
  return session;
}

/** Reads and validates the session on the server (Node runtime). */
export async function getSession(secret: string): Promise<AdminSession | null> {
  const store = await cookies();
  return openSession(store.get(SESSION_COOKIE)?.value, secret);
}

export async function setSession(
  session: Omit<AdminSession, "exp">,
  secret: string,
): Promise<void> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const value = await seal({ ...session, exp }, secret);
  const store = await cookies();
  store.set(SESSION_COOKIE, value, {
    ...COOKIE_BASE,
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { ...COOKIE_BASE, maxAge: 0 });
}

const OAUTH_STATE_TTL_SECONDS = 10 * 60;

interface OAuthStatePayload {
  state: string;
  /** Unix SECONDS, matching AdminSession.exp. */
  exp: number;
  /** Where to land after sign-in. Always an /admin path — see safeNextPath. */
  next?: string;
}

/**
 * Constrains the post-login redirect to a path inside this admin.
 *
 * The value starts life as a query parameter, so it is attacker-supplied by
 * definition; unchecked it is an open redirect. Requiring a single leading
 * slash rejects both absolute URLs (`https://evil.test`) and the protocol-
 * relative `//evil.test` that a naive "starts with /" test lets straight
 * through. It is sealed into the state cookie rather than carried through
 * GitHub, so it cannot be swapped mid-flight either.
 */
export function safeNextPath(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("/admin")) return null;
  if (value.startsWith("//")) return null;
  if (value.includes("\\")) return null;
  // No sending someone back to the login page they just came from.
  if (value === "/admin/login" || value.startsWith("/admin/login?"))
    return null;
  if (value.startsWith("/admin/auth/")) return null;
  return value;
}

/** Short-lived cookie holding the OAuth `state` between redirect and callback. */
export async function setOAuthState(
  state: string,
  secret: string,
  next?: string | null,
): Promise<void> {
  const payload: OAuthStatePayload = {
    state,
    exp: Math.floor(Date.now() / 1000) + OAUTH_STATE_TTL_SECONDS,
    ...(next ? { next } : {}),
  };
  const value = await seal(payload, secret);
  const store = await cookies();
  store.set(STATE_COOKIE, value, {
    ...COOKIE_BASE,
    maxAge: OAUTH_STATE_TTL_SECONDS,
  });
}

export async function takeOAuthState(
  secret: string,
): Promise<{ state: string; next: string | null } | null> {
  const store = await cookies();
  const payload = await unseal<OAuthStatePayload>(
    store.get(STATE_COOKIE)?.value,
    secret,
  );
  // Single use — burn it whether or not it validated.
  store.set(STATE_COOKIE, "", { ...COOKIE_BASE, maxAge: 0 });
  if (!payload || typeof payload.exp !== "number") return null;
  if (payload.exp * 1000 <= Date.now()) return null;
  // Re-validate on the way out: sealed is not the same as still-acceptable.
  return { state: payload.state, next: safeNextPath(payload.next) };
}
