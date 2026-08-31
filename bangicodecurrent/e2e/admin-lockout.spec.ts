import { test, expect } from "@playwright/test";
import mysql from "mysql2/promise";
import { signIn, findUserByEmail } from "../src/lib/admin/users";
import { hashPassword } from "../src/lib/admin/password";

/*
 * Account lockout. See ADR 0003.
 *
 * This is the part that replaces something GitHub used to do for free. With
 * OAuth, sign-in throttling and 2FA were someone else's problem; now the only
 * thing making an online guessing attack expensive is the counter in
 * `users.ts`. It is worth testing against a real database rather than a mock,
 * because half the behaviour lives in the SQL — `DATE_ADD(NOW(), INTERVAL ?
 * MINUTE)` and the reset-to-zero on success.
 *
 * Skipped when no database is configured, which is what a fresh checkout and
 * the unconfigured CI job look like.
 */

const HAS_DB = Boolean(process.env.DB_HOST && process.env.DB_NAME);
test.skip(!HAS_DB, "no database configured (set DB_HOST/DB_NAME)");

// scrypt is deliberately slow and each sign-in pays for it, including the
// dummy hash for unknown emails.
test.describe.configure({ mode: "serial", timeout: 90_000 });

const EMAIL = "lockout-test@bangicode.test";
const PASSWORD = "correct-horse-battery-staple";

async function raw() {
  return mysql.createConnection({
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME!,
  });
}

test.beforeEach(async () => {
  const conn = await raw();
  await conn.query("DELETE FROM users WHERE email = ?", [EMAIL]);
  await conn.query(
    "INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)",
    [EMAIL, "Lockout Test", await hashPassword(PASSWORD)],
  );
  await conn.end();
});

test.afterAll(async () => {
  const conn = await raw();
  await conn.query("DELETE FROM users WHERE email = ?", [EMAIL]);
  await conn.end();
});

test("a correct password signs in and records the login", async () => {
  const result = await signIn(EMAIL, PASSWORD);
  expect(result.ok).toBe(true);

  const user = await findUserByEmail(EMAIL);
  expect(user?.last_login_at).not.toBeNull();
});

test("an unknown email is refused without revealing that it is unknown", async () => {
  const result = await signIn("definitely-not-a-user@bangicode.test", PASSWORD);
  expect(result.ok).toBe(false);
  // Same reason as a wrong password — the form must not be an account
  // enumerator. `users.ts` also hashes a dummy so the TIMING does not give
  // away what the wording withholds.
  expect(result.ok === false && result.reason).toBe("invalid");
});

test("five wrong passwords lock the account, and the right one then fails too", async () => {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const result = await signIn(EMAIL, "wrong-password");
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason, `attempt ${attempt}`).toBe(
      "invalid",
    );
  }

  const fifth = await signIn(EMAIL, "wrong-password");
  expect(fifth.ok).toBe(false);
  expect(fifth.ok === false && fifth.reason).toBe("locked");

  // The point of a lockout: knowing the password is no longer enough.
  const withCorrect = await signIn(EMAIL, PASSWORD);
  expect(withCorrect.ok).toBe(false);
  expect(withCorrect.ok === false && withCorrect.reason).toBe("locked");
});

test("a successful sign-in clears the counter", async () => {
  await signIn(EMAIL, "wrong-password");
  await signIn(EMAIL, "wrong-password");
  expect((await findUserByEmail(EMAIL))?.failed_attempts).toBe(2);

  await signIn(EMAIL, PASSWORD);

  // Without this, four typos spread over a year would leave the account one
  // mistake away from a lockout forever.
  expect((await findUserByEmail(EMAIL))?.failed_attempts).toBe(0);
  expect((await findUserByEmail(EMAIL))?.locked_until).toBeNull();
});
