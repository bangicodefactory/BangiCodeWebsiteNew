/**
 * Authenticated encryption for the admin session cookie.
 *
 * Built on the Web Crypto API (`crypto.subtle`), NOT `node:crypto`, and that is
 * load-bearing: this same code runs inside Next's middleware, which executes on
 * the Edge runtime where `node:crypto` does not exist. Web Crypto is present in
 * both runtimes, so the session can be verified at the edge — the guard is a
 * real check, not just a "cookie is present" glance.
 *
 * AES-256-GCM gives confidentiality AND integrity in one primitive: the cookie
 * carries a GitHub access token, and a tampered cookie fails to decrypt rather
 * than decrypting into something attacker-chosen.
 */

const IV_BYTES = 12; // 96-bit nonce, the size AES-GCM is specified for

function b64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(value: string): Uint8Array | null {
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

/**
 * The secret is a passphrase, not key material, so it is hashed to exactly 32
 * bytes rather than being used raw.
 */
async function deriveKey(secret: string): Promise<CryptoKey> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(secret),
  );
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

/** Encrypts a JSON-serialisable payload into a cookie-safe string. */
export async function seal(payload: unknown, secret: string): Promise<string> {
  const key = await deriveKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext),
  );
  const combined = new Uint8Array(iv.length + ciphertext.length);
  combined.set(iv, 0);
  combined.set(ciphertext, iv.length);
  return b64urlEncode(combined);
}

/**
 * Returns null for anything that is not an intact payload sealed with this
 * secret — wrong secret, truncated cookie, flipped bit, garbage. Callers treat
 * null as "not signed in"; there is no error path that leaks why.
 */
export async function unseal<T>(
  token: string | undefined,
  secret: string,
): Promise<T | null> {
  if (!token) return null;
  const combined = b64urlDecode(token);
  if (!combined || combined.length <= IV_BYTES) return null;

  try {
    const key = await deriveKey(secret);
    const iv = combined.slice(0, IV_BYTES);
    const ciphertext = combined.slice(IV_BYTES);
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext,
    );
    return JSON.parse(new TextDecoder().decode(plaintext)) as T;
  } catch {
    return null;
  }
}

/** URL-safe random token — used for the OAuth `state` parameter. */
export function randomToken(bytes = 32): string {
  return b64urlEncode(crypto.getRandomValues(new Uint8Array(bytes)));
}

/**
 * Constant-time string comparison, for the OAuth state check. Short-circuiting
 * on the first differing byte leaks position information via timing.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
