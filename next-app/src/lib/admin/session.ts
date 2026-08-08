import { cookies } from "next/headers";
import { seal, unseal } from "./crypto";

/**
 * Stateless admin sessions. See ADR 0003.
 *
 * The session carries IDENTITY ONLY — who is signed in, and until when. No
 * credential of any kind, so a stolen cookie grants this admin UI and nothing
 * else.
 *
 * Encrypted rather than merely signed: the payload is small, AES-GCM gives
 * integrity in the same primitive, and it keeps the signed-in address out of
 * anything that can read the cookie jar.
 *
 * Stateless by design, and this survived the move off GitHub unchanged. It is
 * what lets `middleware.ts` verify a session at the EDGE without a database
 * round trip — a session store would have forced either a DB call in
 * middleware or a downgrade to a presence check. It also means a Passenger
 * respawn on shared hosting does not sign everyone out.
 */

export const SESSION_COOKIE = "bangicode_admin";

/** 8 hours. Access is no longer revocable centrally — removing someone's
 *  account should not leave them publishing for a week — so a session should
 *  not outlive a working day. */
export const SESSION_TTL_SECONDS = 8 * 60 * 60;

export interface AdminSession {
  /** users.id — recorded as the author on every content revision. */
  userId: number;
  email: string;
  name: string;
  /** Unix SECONDS. Checked on every read — a sealed cookie is not enough. */
  exp: number;
}

/** The subset safe to hand to a component. Deliberately excludes `exp`. */
export type AdminUser = Pick<AdminSession, "userId" | "email" | "name">;

export function toAdminUser(session: AdminSession): AdminUser {
  return {
    userId: session.userId,
    email: session.email,
    name: session.name,
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
    typeof session.userId !== "number" ||
    typeof session.email !== "string" ||
    typeof session.name !== "string"
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

/**
 * Constrains the post-login redirect to a path inside this admin.
 *
 * The value starts life as a query parameter, so it is attacker-supplied by
 * definition; unchecked it is an open redirect. Requiring a single leading
 * slash rejects both absolute URLs (`https://evil.test`) and the protocol-
 * relative `//evil.test` that a naive "starts with /" test lets straight
 * through.
 *
 * With OAuth gone there is no longer a redirect through a third party to
 * protect it from, but the value still round-trips through a hidden form field
 * the browser can be made to submit — so it is validated on the way in AND
 * again before it is used.
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
