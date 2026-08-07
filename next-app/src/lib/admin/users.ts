import { execute, query } from "@/lib/db";
import { verifyPassword } from "./password";

/**
 * Admin accounts and sign-in. See ADR 0003.
 *
 * GitHub used to do this job: it rate-limited sign-in, enforced 2FA, and let
 * you revoke access by removing someone from the org. None of that is free any
 * more, so the parts that matter most are rebuilt here — throttling and
 * lockout. 2FA is not, and that is a known gap recorded in the ADR.
 */

/** Wrong attempts before the account stops accepting any password. */
const MAX_FAILED_ATTEMPTS = 5;
/** How long it stays locked. Long enough to kill guessing, short enough to
 *  survive a genuinely forgotten password without a shell. */
const LOCKOUT_MINUTES = 15;

export interface AdminUserRow {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  failed_attempts: number;
  locked_until: string | null;
  last_login_at: string | null;
}

export type SignInResult =
  | { ok: true; user: { id: number; email: string; name: string } }
  | { ok: false; reason: "invalid" | "locked"; retryAfterMinutes?: number };

function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findUserByEmail(
  email: string,
): Promise<AdminUserRow | null> {
  const rows = await query<AdminUserRow>(
    "SELECT id, email, name, password_hash, failed_attempts, locked_until, last_login_at FROM users WHERE email = ? LIMIT 1",
    [normaliseEmail(email)],
  );
  return rows[0] ?? null;
}

export async function countUsers(): Promise<number> {
  const rows = await query<{ n: number }>("SELECT COUNT(*) AS n FROM users");
  return Number(rows[0]?.n ?? 0);
}

function lockedMinutesRemaining(lockedUntil: string | null): number | null {
  if (!lockedUntil) return null;
  // dateStrings is on, so this is 'YYYY-MM-DD HH:MM:SS' in the server's zone.
  const until = new Date(lockedUntil.replace(" ", "T")).getTime();
  if (Number.isNaN(until)) return null;
  const remaining = until - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 60_000) : null;
}

/**
 * Verifies a password and applies lockout.
 *
 * The password is checked even when the email is unknown, against a dummy hash
 * of the same cost. Skipping the work for a missing user makes "no such
 * account" measurably faster than "wrong password", which turns the login form
 * into an account enumerator — and the coarse error message would then be
 * undone by a stopwatch.
 */
const DUMMY_HASH =
  "scrypt$32768$8$1$AAAAAAAAAAAAAAAAAAAAAA$" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export async function signIn(
  email: string,
  password: string,
): Promise<SignInResult> {
  const user = await findUserByEmail(email);

  if (!user) {
    await verifyPassword(password, DUMMY_HASH);
    return { ok: false, reason: "invalid" };
  }

  const remaining = lockedMinutesRemaining(user.locked_until);
  if (remaining !== null) {
    /*
     * Hash anyway, and throw the answer away.
     *
     * Returning straight from here was measurably faster than every other
     * outcome — ~28ms against ~230ms — because it skipped the scrypt work.
     * That is an account enumerator: lock a candidate address with five bad
     * attempts, then watch for the response that comes back quickly. Paying
     * the same cost makes a locked account indistinguishable from a wrong
     * password or an address that was never registered.
     */
    await verifyPassword(password, user.password_hash);
    return { ok: false, reason: "locked", retryAfterMinutes: remaining };
  }

  const valid = await verifyPassword(password, user.password_hash);

  if (!valid) {
    const attempts = user.failed_attempts + 1;
    if (attempts >= MAX_FAILED_ATTEMPTS) {
      await execute(
        "UPDATE users SET failed_attempts = ?, locked_until = DATE_ADD(NOW(), INTERVAL ? MINUTE) WHERE id = ?",
        [attempts, LOCKOUT_MINUTES, user.id],
      );
      return {
        ok: false,
        reason: "locked",
        retryAfterMinutes: LOCKOUT_MINUTES,
      };
    }
    await execute("UPDATE users SET failed_attempts = ? WHERE id = ?", [
      attempts,
      user.id,
    ]);
    return { ok: false, reason: "invalid" };
  }

  // Success clears the counter — otherwise four failures spread over months
  // would leave the account one mistake from a lockout forever.
  await execute(
    "UPDATE users SET failed_attempts = 0, locked_until = NULL, last_login_at = NOW() WHERE id = ?",
    [user.id],
  );

  return {
    ok: true,
    user: { id: user.id, email: user.email, name: user.name },
  };
}
