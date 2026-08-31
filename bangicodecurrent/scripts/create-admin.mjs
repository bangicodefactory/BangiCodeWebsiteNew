#!/usr/bin/env node
/**
 * Creates an admin account, or resets one's password. See ADR 0003.
 *
 * There is no sign-up form, and this is why: an open registration page on a
 * CMS is a liability, and an invite flow needs an email sender the host may not
 * provide. Creating accounts requires shell access, which is a reasonable bar
 * for the two or three people who publish.
 *
 * It is also the ONLY password reset there is. That is a real gap, recorded in
 * the ADR rather than papered over: someone who forgets their password needs
 * someone with a terminal.
 *
 *   pnpm admin:create           # create (fails if the email exists)
 *   pnpm admin:passwd           # reset an existing account's password
 *
 * The password is read without echoing, and may also come from ADMIN_PASSWORD
 * for non-interactive use (CI seeding). Never pass it as an argv — argv is
 * visible in the process list to every other account on a shared host.
 */
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import mysql from "mysql2/promise";

const scrypt = promisify(scryptCallback);

/*
 * Kept in step with src/lib/admin/password.ts by hand.
 *
 * Duplicated rather than imported because that module is TypeScript inside the
 * Next path alias graph, and a plain node script cannot load it without a build
 * step. The encoding is self-describing, so a drift in parameters still
 * verifies — only a change of SCHEME would break, and that is a deliberate act.
 */
const PARAMS = { N: 32768, r: 8, p: 1, keylen: 64 };
const MIN_PASSWORD_LENGTH = 12;

async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scrypt(
    password.normalize("NFKC"),
    salt,
    PARAMS.keylen,
    {
      N: PARAMS.N,
      r: PARAMS.r,
      p: PARAMS.p,
      maxmem: 128 * PARAMS.N * PARAMS.r * 2,
    },
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

function connectionConfig() {
  const missing = ["DB_HOST", "DB_USER", "DB_NAME"].filter(
    (n) => !process.env[n]?.trim(),
  );
  if (missing.length > 0) {
    console.error(`admin: missing ${missing.join(", ")}.`);
    console.error(
      "Set them in bangicodecurrent/.env.local — see .env.example.",
    );
    process.exit(1);
  }
  return {
    host: process.env.DB_HOST.trim(),
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER.trim(),
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME.trim(),
    charset: "utf8mb4_unicode_ci",
  };
}

/** Reads a line with the terminal echo turned off, so it stays off screen. */
async function readSecret(rl, prompt) {
  const wasRaw = stdin.isRaw;
  const onKeypress = () => {};
  stdout.write(prompt);

  // rl.question echoes; muting the output stream for the duration is the
  // portable way to suppress it without a dependency.
  const originalWrite = stdout.write.bind(stdout);
  stdout.write = (chunk, ...rest) => {
    // Let newlines through so the cursor still advances.
    if (typeof chunk === "string" && !chunk.includes("\n")) return true;
    return originalWrite(chunk, ...rest);
  };
  try {
    const answer = await rl.question("");
    return answer;
  } finally {
    stdout.write = originalWrite;
    stdout.write("\n");
    if (wasRaw !== undefined && stdin.isTTY) stdin.setRawMode?.(wasRaw);
    stdin.off?.("keypress", onKeypress);
  }
}

async function main() {
  const reset = process.argv.includes("--reset");

  /*
   * Fully non-interactive when all three are in the environment. CI seeds an
   * account this way, and piping answers into the prompts does not work — the
   * stream reaches EOF and readline closes underneath the next question.
   */
  const nonInteractive =
    Boolean(process.env.ADMIN_EMAIL?.trim()) &&
    Boolean(process.env.ADMIN_PASSWORD) &&
    (reset || Boolean(process.env.ADMIN_NAME?.trim()));

  const rl = nonInteractive
    ? null
    : createInterface({ input: stdin, output: stdout });
  const ask = async (prompt) => (rl ? rl.question(prompt) : "");
  const conn = await mysql.createConnection(connectionConfig());

  try {
    const email = (process.env.ADMIN_EMAIL?.trim() || (await ask("Email: ")))
      .trim()
      .toLowerCase();
    if (!email || !email.includes("@")) {
      console.error("admin: that is not an email address.");
      process.exitCode = 1;
      return;
    }

    const [existing] = await conn.query(
      "SELECT id, name FROM users WHERE email = ? LIMIT 1",
      [email],
    );
    const found = existing[0];

    if (reset && !found) {
      console.error(`admin: no account with the email ${email}.`);
      process.exitCode = 1;
      return;
    }
    if (!reset && found) {
      console.error(
        `admin: ${email} already has an account. Use "pnpm admin:passwd" to reset the password.`,
      );
      process.exitCode = 1;
      return;
    }

    let name = found?.name ?? "";
    if (!reset) {
      name = (
        process.env.ADMIN_NAME?.trim() || (await ask("Display name: "))
      ).trim();
      if (!name) {
        console.error("admin: a display name is required.");
        process.exitCode = 1;
        return;
      }
    }

    let password = process.env.ADMIN_PASSWORD ?? "";
    if (!password) {
      password = await readSecret(
        rl,
        `Password (min ${MIN_PASSWORD_LENGTH}): `,
      );
      const again = await readSecret(rl, "Repeat it: ");
      if (password !== again) {
        console.error("admin: those did not match.");
        process.exitCode = 1;
        return;
      }
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      console.error(
        `admin: password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
      process.exitCode = 1;
      return;
    }

    const hash = await hashPassword(password);

    if (reset) {
      // Clearing the lockout is the point of a reset — otherwise the person
      // who just locked themselves out still cannot get in with the new one.
      await conn.query(
        "UPDATE users SET password_hash = ?, failed_attempts = 0, locked_until = NULL WHERE id = ?",
        [hash, found.id],
      );
      console.log(`admin: password reset for ${email}.`);
    } else {
      await conn.query(
        "INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)",
        [email, name, hash],
      );
      console.log(`admin: created ${email}.`);
    }
  } finally {
    rl?.close();
    await conn.end();
  }
}

main().catch((error) => {
  console.error("admin:", error.message);
  process.exit(1);
});
