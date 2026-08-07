import { test, expect } from "@playwright/test";
import {
  commitFiles,
  describeError,
  type FileChange,
} from "../src/lib/admin/github";
import type { AdminConfig } from "../src/lib/admin/config";

/*
 * Unit tests for the commit layer, against a stubbed GitHub API.
 *
 * These exist because the property that matters — "every locale of a post lands
 * in ONE commit" — is invisible in normal use and only shows up as a
 * half-published post in production. Asserting the request sequence is the only
 * cheap way to know the Git Data API is being driven correctly.
 *
 * No browser involved; Playwright is just the runner already in the repo.
 */

const CONFIG: AdminConfig = {
  githubApiUrl: "https://api.github.com",
  githubClientId: "id",
  githubClientSecret: "secret",
  githubOrg: "bangicodefactory",
  githubRepo: "bangicodefactory/site",
  githubBranch: "main",
  sessionSecret: "x".repeat(40),
  siteUrl: "https://example.test",
};

interface Call {
  url: string;
  method: string;
  body: Record<string, unknown> | null;
}

/** Stubs global fetch with a happy-path GitHub, recording every call. */
function stubGitHub(overrides: Record<string, () => Response> = {}) {
  const calls: Call[] = [];
  const original = globalThis.fetch;

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? "GET";
    calls.push({
      url,
      method,
      body: init?.body ? JSON.parse(String(init.body)) : null,
    });

    for (const [fragment, respond] of Object.entries(overrides)) {
      if (url.includes(fragment)) return respond();
    }

    const json = (data: unknown, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
      });

    if (url.includes("/git/ref/heads/"))
      return json({ object: { sha: "HEAD1" } });
    if (url.includes("/git/commits/HEAD1"))
      return json({ tree: { sha: "TREE1" } });
    if (url.endsWith("/git/trees") && method === "POST")
      return json({ sha: "TREE2" });
    if (url.endsWith("/git/commits") && method === "POST")
      return json({
        sha: "COMMIT2",
        html_url: "https://github.test/c/COMMIT2",
      });
    if (url.includes("/git/refs/heads/") && method === "PATCH")
      return json({ object: { sha: "COMMIT2" } });

    return json({ message: "unhandled" }, 500);
  }) as typeof fetch;

  return {
    calls,
    restore: () => {
      globalThis.fetch = original;
    },
  };
}

const THREE_LOCALES: FileChange[] = [
  { path: "content/blog/en/post.mdx", content: "en body" },
  { path: "content/blog/fr/post.mdx", content: "fr body" },
  { path: "content/blog/ar/post.mdx", content: "ar body" },
];

test("all locales land in a single commit, not one per file", async () => {
  const stub = stubGitHub();
  try {
    const result = await commitFiles(
      CONFIG,
      "token",
      "content: add post",
      THREE_LOCALES,
    );
    expect(result.ok).toBe(true);

    // Exactly one tree, one commit, one ref update — regardless of file count.
    const trees = stub.calls.filter(
      (c) => c.url.endsWith("/git/trees") && c.method === "POST",
    );
    const commits = stub.calls.filter(
      (c) => c.url.endsWith("/git/commits") && c.method === "POST",
    );
    const refUpdates = stub.calls.filter((c) => c.method === "PATCH");
    expect(trees).toHaveLength(1);
    expect(commits).toHaveLength(1);
    expect(refUpdates).toHaveLength(1);

    // And that one tree carries all three files.
    const tree = trees[0].body?.tree as Array<{ path: string }>;
    expect(tree.map((t) => t.path).sort()).toEqual([
      "content/blog/ar/post.mdx",
      "content/blog/en/post.mdx",
      "content/blog/fr/post.mdx",
    ]);
  } finally {
    stub.restore();
  }
});

test("the new tree is layered on the current head, not built from scratch", async () => {
  const stub = stubGitHub();
  try {
    await commitFiles(CONFIG, "token", "msg", THREE_LOCALES);
    const tree = stub.calls.find((c) => c.url.endsWith("/git/trees"));
    // Without base_tree, every file NOT in the change set would be deleted.
    expect(tree?.body?.base_tree).toBe("TREE1");
    const commit = stub.calls.find(
      (c) => c.url.endsWith("/git/commits") && c.method === "POST",
    );
    expect(commit?.body?.parents).toEqual(["HEAD1"]);
    expect(commit?.body?.tree).toBe("TREE2");
  } finally {
    stub.restore();
  }
});

test("the ref update is never forced", async () => {
  const stub = stubGitHub();
  try {
    await commitFiles(CONFIG, "token", "msg", THREE_LOCALES);
    const patch = stub.calls.find((c) => c.method === "PATCH");
    // force:true would silently overwrite a concurrent push.
    expect(patch?.body?.force).toBe(false);
    expect(patch?.body?.sha).toBe("COMMIT2");
  } finally {
    stub.restore();
  }
});

test("deletions are expressed as sha:null tree entries", async () => {
  const stub = stubGitHub();
  try {
    await commitFiles(CONFIG, "token", "remove", [
      { path: "content/portfolio/old.json", delete: true },
    ]);
    const tree = stub.calls.find((c) => c.url.endsWith("/git/trees"));
    const entries = tree?.body?.tree as Array<{ path: string; sha: unknown }>;
    expect(entries[0].path).toBe("content/portfolio/old.json");
    expect(entries[0].sha).toBeNull();
  } finally {
    stub.restore();
  }
});

test("a concurrent push surfaces as a conflict, not a silent overwrite", async () => {
  const stub = stubGitHub({
    "/git/refs/heads/": () =>
      new Response(JSON.stringify({ message: "not a fast forward" }), {
        status: 422,
      }),
  });
  try {
    const result = await commitFiles(CONFIG, "token", "msg", THREE_LOCALES);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe("conflict");
      expect(describeError(result.error)).toContain("someone else published");
    }
  } finally {
    stub.restore();
  }
});

test("a revoked token is reported as an auth failure", async () => {
  const stub = stubGitHub({
    "/git/ref/heads/": () => new Response("{}", { status: 401 }),
  });
  try {
    const result = await commitFiles(CONFIG, "token", "msg", THREE_LOCALES);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe("auth");
      expect(describeError(result.error)).toContain("Sign out");
    }
  } finally {
    stub.restore();
  }
});

test("nothing is committed when the change set is empty", async () => {
  const stub = stubGitHub();
  try {
    const result = await commitFiles(CONFIG, "token", "msg", []);
    expect(result.ok).toBe(false);
    // Must not even reach GitHub — an empty commit is a confusing no-op.
    expect(stub.calls).toHaveLength(0);
  } finally {
    stub.restore();
  }
});

test("error messages never leak the access token", async () => {
  const stub = stubGitHub({
    "/git/ref/heads/": () =>
      new Response(JSON.stringify({ message: "Bad credentials" }), {
        status: 500,
      }),
  });
  try {
    const result = await commitFiles(
      CONFIG,
      "sup3r-s3cret-token",
      "m",
      THREE_LOCALES,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(JSON.stringify(result.error)).not.toContain("sup3r-s3cret-token");
      expect(describeError(result.error)).not.toContain("sup3r-s3cret-token");
    }
  } finally {
    stub.restore();
  }
});
