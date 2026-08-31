import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual as nodeTimingSafeEqual,
  type ScryptOptions,
} from "node:crypto";
import { promisify } from "node:util";

/**
 * Password hashing for local admin accounts. See ADR 0003.
 *
 * `scrypt` from `node:crypto`, NOT argon2 or bcrypt. Both of those ship native
 * binaries, and a native module is exactly the dependency that broke this
 * project once already: `@mdx-js/mdx` resolved fine on a developer machine and
 * was missing where the code actually ran. scrypt is built into Node, so there
 * is nothing to compile, nothing to trace into the standalone bundle, and
 * nothing that can be absent on cPanel.
 *
 * scrypt is memory-hard and a sanctioned choice (RFC 7914, and what Node
 * recommends absent a native argon2). The cost parameters below are stored
 * alongside each hash, so raising them later does not invalidate existing
 * passwords — verify reads the parameters the hash was made with.
 *
 * This module runs in the Node runtime only. Middleware must NOT import it:
 * session verification at the Edge uses Web Crypto in `crypto.ts`, and pulling
 * `node:crypto` into the matcher would break that.
 */

/*
 * promisify picks the 3-argument overload, which drops the options object —
 * and silently hashing at Node's DEFAULT cost instead of the tuned one is the
 * kind of downgrade nothing would ever surface. Assert the shape we actually
 * call so the options argument is type-checked.
 */
const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions,
) => Promise<Buffer>;

/*
 * N=2^15 costs roughly 100ms per hash on modest hardware — slow enough to make
 * offline guessing expensive, fast enough that a login does not feel broken.
 * maxmem must be raised explicitly: Node's 32MB default rejects N this large.
 */
const PARAMS = { N: 32768, r: 8, p: 1, keylen: 64 } as const;
const MAXMEM = 128 * PARAMS.N * PARAMS.r * 2;
const SALT_BYTES = 16;

/**
 * Encodes as `scrypt$N$r$p$salt$hash`, all base64url.
 *
 * Self-describing on purpose. A bare hash cannot be verified after the cost
 * parameters change, and silently locking every account out during a routine
 * hardening bump is a failure mode worth designing away.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const derived = await scrypt(
    password.normalize("NFKC"),
    salt,
    PARAMS.keylen,
    { N: PARAMS.N, r: PARAMS.r, p: PARAMS.p, maxmem: MAXMEM },
  );

  return [
    "scrypt",
    PARAMS.N,
    PARAMS.r,
    PARAMS.p,
    salt.toString("base64url"),
    derived.toString("base64url"),
  ].join("$");
}

/**
 * Returns false for anything that is not this password — wrong password,
 * malformed record, unknown algorithm. Never throws, so a corrupt row cannot
 * turn a failed login into a 500 that reveals the row exists.
 */
export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6) return false;

  const [scheme, nRaw, rRaw, pRaw, saltRaw, hashRaw] = parts as [
    string,
    string,
    string,
    string,
    string,
    string,
  ];
  if (scheme !== "scrypt") return false;

  const N = Number(nRaw);
  const r = Number(rRaw);
  const p = Number(pRaw);
  if (!Number.isInteger(N) || !Number.isInteger(r) || !Number.isInteger(p)) {
    return false;
  }
  // Refuse absurd parameters from a tampered row rather than allocating GBs.
  if (N < 1024 || N > 1_048_576 || r < 1 || r > 32 || p < 1 || p > 16) {
    return false;
  }

  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(saltRaw, "base64url");
    expected = Buffer.from(hashRaw, "base64url");
  } catch {
    return false;
  }
  if (salt.length === 0 || expected.length === 0) return false;

  let derived: Buffer;
  try {
    derived = await scrypt(password.normalize("NFKC"), salt, expected.length, {
      N,
      r,
      p,
      maxmem: 128 * N * r * 2,
    });
  } catch {
    return false;
  }

  // Length check first: timingSafeEqual throws on a mismatch rather than
  // returning false, and that throw would itself be an oracle.
  if (derived.length !== expected.length) return false;
  return nodeTimingSafeEqual(derived, expected);
}

/**
 * The bar a new password has to clear.
 *
 * Length only, deliberately. Character-class rules push people toward
 * `Password1!` and are no longer recommended (NIST SP 800-63B); a long
 * passphrase or a generated string is what this is trying to encourage, and
 * accounts here are created by someone with shell access, not the public.
 */
export const MIN_PASSWORD_LENGTH = 12;

export function passwordProblem(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password.trim().length === 0) return "Password cannot be blank.";
  return null;
}
