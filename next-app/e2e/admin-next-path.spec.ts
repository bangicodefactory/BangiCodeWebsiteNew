import { test, expect } from "@playwright/test";
import { safeNextPath } from "../src/lib/admin/session";

/*
 * The post-login redirect target.
 *
 * This value begins as a query parameter the middleware copies off an incoming
 * URL, which makes it attacker-supplied by definition. Unchecked it is an open
 * redirect on a page whose entire job is to be trusted: "sign in to publish",
 * then a bounce to somewhere else entirely.
 *
 * The cases below are the ones a "starts with /" check gets wrong. They are
 * cheap to assert and expensive to discover later.
 *
 * No browser involved; Playwright is just the runner already in the repo.
 */

test("accepts admin paths, including query strings", () => {
  expect(safeNextPath("/admin")).toBe("/admin");
  expect(safeNextPath("/admin/blog")).toBe("/admin/blog");
  expect(safeNextPath("/admin/portfolio/rentcar")).toBe(
    "/admin/portfolio/rentcar",
  );
  expect(safeNextPath("/admin/blog?deleted=x")).toBe("/admin/blog?deleted=x");
});

test("rejects anything that leaves this origin", () => {
  // The classic: "starts with a slash" is true for all of these.
  expect(safeNextPath("//evil.test")).toBeNull();
  expect(safeNextPath("//evil.test/admin")).toBeNull();
  expect(safeNextPath("https://evil.test")).toBeNull();
  expect(safeNextPath("http://evil.test/admin")).toBeNull();
  // Backslashes: some parsers normalise these to forward slashes.
  expect(safeNextPath("/\\evil.test")).toBeNull();
  expect(safeNextPath("/admin\\..\\..")).toBeNull();
});

test("rejects paths outside the admin", () => {
  expect(safeNextPath("/")).toBeNull();
  expect(safeNextPath("/en/portfolio")).toBeNull();
  expect(safeNextPath("/smoke")).toBeNull();
});

test("refuses to bounce back into the sign-in flow", () => {
  // Landing on /admin/login after signing in reads as a failed sign-in, and
  // /admin/auth/* would re-enter the OAuth dance with a spent state cookie.
  expect(safeNextPath("/admin/login")).toBeNull();
  expect(safeNextPath("/admin/login?error=denied")).toBeNull();
  expect(safeNextPath("/admin/auth/callback")).toBeNull();
  expect(safeNextPath("/admin/auth/logout")).toBeNull();
});

test("treats absent or empty input as no redirect", () => {
  expect(safeNextPath(undefined)).toBeNull();
  expect(safeNextPath(null)).toBeNull();
  expect(safeNextPath("")).toBeNull();
});
