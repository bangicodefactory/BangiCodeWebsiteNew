import { test, expect } from "@playwright/test";
import { hashPassword, verifyPassword } from "../src/lib/admin/password";

/*
 * The password primitives. See ADR 0003.
 *
 * These matter more than most unit tests here, because GitHub used to do this
 * job and now nothing else does: this function and the lockout in `users.ts`
 * are the whole of what stands between a guessed password and the publish
 * button.
 *
 * Every negative case below returns FALSE rather than throwing. A corrupt or
 * tampered row must not turn a failed sign-in into a 500 — the error page
 * itself would confirm the account exists.
 *
 * No browser involved; Playwright is just the runner already in the repo.
 */

// scrypt at N=2^15 is deliberately slow (~100ms each). Several hashes per test
// comfortably exceeds the default timeout on a loaded machine.
test.describe.configure({ timeout: 60_000 });

const PASSWORD = "correct-horse-battery-staple";

test("a correct password verifies, a wrong one does not", async () => {
  const hash = await hashPassword(PASSWORD);
  expect(await verifyPassword(PASSWORD, hash)).toBe(true);
  expect(await verifyPassword("wrong", hash)).toBe(false);
  expect(await verifyPassword("", hash)).toBe(false);
  // Off by one character.
  expect(await verifyPassword(PASSWORD + "x", hash)).toBe(false);
});

test("the hash is salted — the same password twice is not the same record", async () => {
  const a = await hashPassword("same-password");
  const b = await hashPassword("same-password");
  expect(a).not.toBe(b);
  // ...and both still verify, which is what proves the salt is stored with it.
  expect(await verifyPassword("same-password", a)).toBe(true);
  expect(await verifyPassword("same-password", b)).toBe(true);
});

test("the record is self-describing, so cost can be raised later", async () => {
  const hash = await hashPassword(PASSWORD);
  const [scheme, n, r, p, salt, digest] = hash.split("$");
  expect(scheme).toBe("scrypt");
  expect(Number(n)).toBeGreaterThanOrEqual(32768);
  expect(Number(r)).toBe(8);
  expect(Number(p)).toBe(1);
  expect(salt).toBeTruthy();
  expect(digest).toBeTruthy();
});

test("a tampered or malformed record fails closed rather than throwing", async () => {
  const hash = await hashPassword(PASSWORD);

  // Flipped digest.
  expect(await verifyPassword(PASSWORD, hash.slice(0, -2) + "AA")).toBe(false);
  // Not a hash at all.
  expect(await verifyPassword(PASSWORD, "not-a-hash")).toBe(false);
  expect(await verifyPassword(PASSWORD, "")).toBe(false);
  // Right shape, wrong algorithm — someone swapping in a bcrypt record must
  // not be silently accepted by a verifier that cannot check it.
  expect(await verifyPassword(PASSWORD, "bcrypt$32768$8$1$AAAA$AAAA")).toBe(
    false,
  );
  // Missing fields.
  expect(await verifyPassword(PASSWORD, "scrypt$32768$8$1$AAAA")).toBe(false);
});

test("absurd cost parameters are refused, not obeyed", async () => {
  // A tampered row asking for N=2^30 would try to allocate many gigabytes.
  // Refusing is both a correctness and an availability property: a login form
  // that can be made to exhaust the server's memory is a denial-of-service.
  expect(await verifyPassword("x", "scrypt$1073741824$8$1$AAAA$AAAA")).toBe(
    false,
  );
  expect(await verifyPassword("x", "scrypt$0$8$1$AAAA$AAAA")).toBe(false);
  expect(await verifyPassword("x", "scrypt$32768$999$1$AAAA$AAAA")).toBe(false);
  expect(await verifyPassword("x", "scrypt$abc$8$1$AAAA$AAAA")).toBe(false);
});

test("unicode passwords normalise, so the same characters always match", async () => {
  /*
   * "e-acute" composed (U+00E9) vs decomposed (e + U+0301): identical to a
   * human, different bytes. Without NFKC a password typed on one keyboard
   * layout would not verify on another.
   *
   * The two literals below look identical on screen and are not, which would
   * normally make this a test that passes for invisible reasons. The
   * `not.toBe` assertion is what keeps it honest: if an editor ever normalises
   * this file and collapses them to the same bytes, that line FAILS loudly
   * rather than letting the test quietly become a tautology.
   */
  const composed = "café-password-1234";
  const decomposed = "café-password-1234";
  expect(composed).not.toBe(decomposed);
  expect(composed.normalize("NFKC")).toBe(decomposed.normalize("NFKC"));

  const hash = await hashPassword(composed);
  expect(await verifyPassword(decomposed, hash)).toBe(true);
});
