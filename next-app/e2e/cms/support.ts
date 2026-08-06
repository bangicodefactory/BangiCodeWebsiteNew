import {
  test as base,
  expect,
  type Page,
  type APIRequestContext,
} from "@playwright/test";

/**
 * Shared setup for the CMS suite: a signed-in session and a clean stub repo.
 *
 * The session cookie is sealed here with the SAME algorithm as
 * src/lib/admin/crypto.ts rather than imported from it. Re-implementing means a
 * green test proves the cookie FORMAT is what the server expects, not merely
 * that the code agrees with itself — if either side drifts, these fail.
 */

const SECRET = "playwright-cms-suite-secret-at-least-32-characters-long";
const STUB = "http://localhost:4599";

function b64url(bytes: Uint8Array): string {
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function sealSession(expiresInSeconds = 3600): Promise<string> {
  const payload = {
    login: "ahmed",
    name: "Ahmed Chioua",
    avatarUrl: "",
    accessToken: "stub-token",
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(SECRET),
  );
  const key = await crypto.subtle.importKey(
    "raw",
    digest,
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(JSON.stringify(payload)),
    ),
  );
  const combined = new Uint8Array(iv.length + ciphertext.length);
  combined.set(iv, 0);
  combined.set(ciphertext, iv.length);
  return b64url(combined);
}

export interface StubCommit {
  sha: string;
  message: string;
  author?: { name: string; email: string };
  parents: string[];
  baseTree?: string;
  files: Array<{ path: string; content?: string; deleted?: boolean }>;
}

export async function resetRepo(request: APIRequestContext): Promise<void> {
  await request.post(`${STUB}/__reset`);
}

export async function getCommits(
  request: APIRequestContext,
): Promise<StubCommit[]> {
  const res = await request.get(`${STUB}/__commits`);
  return (await res.json()) as StubCommit[];
}

/** Signs the browser in and starts every test from a clean repository. */
export const test = base.extend<{ signedIn: Page }>({
  signedIn: async ({ page, context, request }, use) => {
    await resetRepo(request);
    await context.addCookies([
      {
        name: "bangicode_admin",
        value: await sealSession(),
        domain: "localhost",
        path: "/admin",
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
    await use(page);
  },
});

export { expect };
