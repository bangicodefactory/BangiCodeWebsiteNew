import { cookies } from "next/headers";
import { seal, unseal } from "./crypto";

/**
 * Stateless admin sessions.
 *
 * The whole session — including the user's GitHub access token — lives inside
 * one AES-GCM sealed cookie. No session store, which suits a self-hosted single
 * node and means a restart does not sign everyone out.
 *
 * The token is in the cookie because commits are attributed to the person who
 * made them: the CMS pushes as the signed-in user, not as a bot. The cookie is
 * encrypted (not merely signed) precisely because it carries that token.
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
  accessToken: string;
  /** Unix seconds. Checked on every read — a sealed cookie is not enough. */
  exp: number;
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
  if (
    typeof session.exp !== "number" ||
    typeof session.accessToken !== "string" ||
    typeof session.login !== "string"
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

/** Short-lived cookie holding the OAuth `state` between redirect and callback. */
export async function setOAuthState(
  state: string,
  secret: string,
): Promise<void> {
  const value = await seal({ state, exp: Date.now() + 10 * 60 * 1000 }, secret);
  const store = await cookies();
  store.set(STATE_COOKIE, value, { ...COOKIE_BASE, maxAge: 600 });
}

export async function takeOAuthState(secret: string): Promise<string | null> {
  const store = await cookies();
  const payload = await unseal<{ state: string; exp: number }>(
    store.get(STATE_COOKIE)?.value,
    secret,
  );
  // Single use — burn it whether or not it validated.
  store.set(STATE_COOKIE, "", { ...COOKIE_BASE, maxAge: 0 });
  if (!payload || payload.exp <= Date.now()) return null;
  return payload.state;
}
