import type { AdminConfig } from "./config";

/**
 * The repository as the CMS's data store.
 *
 * Writes go through the **Git Data API** (blob → tree → commit → ref), not the
 * simpler Contents API. That is the whole point: the Contents API writes one
 * file per request, so publishing a post would be three separate commits and
 * three separate windows in which the post exists in English but not Arabic.
 * With "all three locales required to publish" as a locked rule, a half-written
 * post is a bug the site would happily render. The Git Data API lets every file
 * in a publish land as ONE commit, so the repo is never in a partial state.
 *
 * Reads go to GitHub too, not to the local filesystem. The running server's
 * `content/` directory is whatever was baked in at build time, so straight after
 * publishing it is stale — the admin would show the editor the previous version
 * of what they just saved. The public site keeps reading from disk (fast,
 * static); the admin reads from the branch (correct).
 */

export type GitHubError =
  | { kind: "auth" } // token rejected — sign in again
  | { kind: "not_found"; path?: string }
  | { kind: "conflict" } // branch moved under us
  | { kind: "rate_limited"; retryAfterSeconds?: number }
  | { kind: "network" }
  | { kind: "unexpected"; status: number; detail: string };

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: GitHubError };

function repoPath(config: AdminConfig, suffix: string): string {
  return `${config.githubApiUrl}/repos/${config.githubRepo}${suffix}`;
}

async function request(
  url: string,
  token: string,
  init?: RequestInit,
): Promise<Result<unknown>> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
      cache: "no-store",
    });
  } catch {
    return { ok: false, error: { kind: "network" } };
  }

  if (response.status === 401) return { ok: false, error: { kind: "auth" } };
  if (response.status === 404)
    return { ok: false, error: { kind: "not_found" } };
  /*
   * Only 409 is a conflict. 422 was folded in here too, but it is GitHub's
   * generic validation error — a malformed tree entry or a bad field reports
   * 422, and telling the author "someone else published, reload and reapply"
   * sends them chasing a race that never happened while hiding a real bug.
   * It falls through to `unexpected`, which surfaces GitHub's own message.
   */
  if (response.status === 409)
    return { ok: false, error: { kind: "conflict" } };
  if (
    response.status === 429 ||
    (response.status === 403 &&
      response.headers.get("x-ratelimit-remaining") === "0")
  ) {
    /*
     * Two shapes to read. Primary limits answer 403 with x-ratelimit-reset (an
     * absolute unix time); SECONDARY limits — which is what abuse detection
     * returns for a burst of writes, exactly what publishing does — answer 429
     * with retry-after (a delay in seconds). Only the first was handled, so a
     * throttled publish reported an unexplained error instead of "try again in
     * a minute".
     */
    const retryAfter = Number(response.headers.get("retry-after") ?? 0);
    const reset = Number(response.headers.get("x-ratelimit-reset") ?? 0);
    const retryAfterSeconds = retryAfter
      ? retryAfter
      : reset
        ? Math.max(0, reset - Math.floor(Date.now() / 1000))
        : undefined;
    return {
      ok: false,
      error: { kind: "rate_limited", retryAfterSeconds },
    };
  }

  if (!response.ok) {
    // Body may carry a useful GitHub message; it never contains the token,
    // which lives only in the request header.
    let detail = "";
    try {
      const body = (await response.json()) as { message?: string };
      detail = body.message ?? "";
    } catch {
      /* non-JSON error body */
    }
    return {
      ok: false,
      error: { kind: "unexpected", status: response.status, detail },
    };
  }

  if (response.status === 204) return { ok: true, value: null };
  return { ok: true, value: await response.json() };
}

/* ── Reads ─────────────────────────────────────────────────────────────── */

export interface RepoFile {
  path: string;
  /** Decoded UTF-8 text. */
  text: string;
  /** Blob SHA — GitHub's own content hash, useful for change detection. */
  sha: string;
}

export async function getFile(
  config: AdminConfig,
  token: string,
  path: string,
): Promise<Result<RepoFile | null>> {
  const url = repoPath(
    config,
    `/contents/${encodeContentPath(path)}?ref=${encodeURIComponent(config.githubBranch)}`,
  );
  const result = await request(url, token);
  if (!result.ok) {
    // A missing file is a legitimate answer, not a failure.
    if (result.error.kind === "not_found") return { ok: true, value: null };
    return result;
  }
  const data = result.value as {
    content?: string;
    encoding?: string;
    sha?: string;
    type?: string;
  };
  if (data.type !== "file" || typeof data.content !== "string") {
    return { ok: true, value: null };
  }
  return {
    ok: true,
    value: {
      path,
      text: decodeBase64(data.content),
      sha: data.sha ?? "",
    },
  };
}

export interface RepoDirEntry {
  name: string;
  path: string;
  type: "file" | "dir";
}

export async function listDirectory(
  config: AdminConfig,
  token: string,
  path: string,
): Promise<Result<RepoDirEntry[]>> {
  const url = repoPath(
    config,
    `/contents/${encodeContentPath(path)}?ref=${encodeURIComponent(config.githubBranch)}`,
  );
  const result = await request(url, token);
  if (!result.ok) {
    // An absent directory is an empty directory as far as callers care.
    if (result.error.kind === "not_found") return { ok: true, value: [] };
    return result;
  }
  const data = result.value;
  if (!Array.isArray(data)) return { ok: true, value: [] };
  return {
    ok: true,
    value: (data as Array<{ name: string; path: string; type: string }>)
      .filter((e) => e.type === "file" || e.type === "dir")
      .map((e) => ({
        name: e.name,
        path: e.path,
        type: e.type as "file" | "dir",
      })),
  };
}

/* ── Writes ────────────────────────────────────────────────────────────── */

export type FileChange =
  | { path: string; content: string }
  | { path: string; delete: true };

export interface CommitResult {
  sha: string;
  url: string;
}

/**
 * Applies every change as a single commit on the configured branch.
 *
 * Steps: read the branch head → build a new tree on top of its tree → create a
 * commit → fast-forward the ref. The ref update is NOT forced, so if anything
 * else pushed between the first and last step GitHub rejects it and the caller
 * gets `conflict` rather than silently clobbering someone's work.
 */
export async function commitFiles(
  config: AdminConfig,
  token: string,
  message: string,
  changes: FileChange[],
  author?: { name: string; email: string },
): Promise<Result<CommitResult>> {
  if (changes.length === 0) {
    return {
      ok: false,
      error: { kind: "unexpected", status: 0, detail: "no changes" },
    };
  }

  const branch = config.githubBranch;

  // 1. Current head of the branch.
  const refResult = await request(
    repoPath(config, `/git/ref/heads/${encodeURIComponent(branch)}`),
    token,
  );
  if (!refResult.ok) return refResult;
  const headSha = (refResult.value as { object?: { sha?: string } }).object
    ?.sha;
  if (!headSha) {
    return {
      ok: false,
      error: { kind: "unexpected", status: 0, detail: "branch has no head" },
    };
  }

  // 2. Tree of that commit.
  const commitResult = await request(
    repoPath(config, `/git/commits/${headSha}`),
    token,
  );
  if (!commitResult.ok) return commitResult;
  const baseTree = (commitResult.value as { tree?: { sha?: string } }).tree
    ?.sha;
  if (!baseTree) {
    return {
      ok: false,
      error: { kind: "unexpected", status: 0, detail: "commit has no tree" },
    };
  }

  // 3. New tree layered on the old one. `sha: null` deletes a path.
  const treeEntries = changes.map((change) =>
    "delete" in change
      ? { path: change.path, mode: "100644", type: "blob", sha: null }
      : {
          path: change.path,
          mode: "100644",
          type: "blob",
          content: change.content,
        },
  );

  const treeResult = await request(repoPath(config, "/git/trees"), token, {
    method: "POST",
    body: JSON.stringify({ base_tree: baseTree, tree: treeEntries }),
  });
  if (!treeResult.ok) return treeResult;
  const newTree = (treeResult.value as { sha?: string }).sha;
  if (!newTree) {
    return {
      ok: false,
      error: { kind: "unexpected", status: 0, detail: "tree not created" },
    };
  }

  // 4. The commit itself.
  const newCommitResult = await request(
    repoPath(config, "/git/commits"),
    token,
    {
      method: "POST",
      body: JSON.stringify({
        message,
        tree: newTree,
        parents: [headSha],
        ...(author ? { author } : {}),
      }),
    },
  );
  if (!newCommitResult.ok) return newCommitResult;
  const created = newCommitResult.value as { sha?: string; html_url?: string };
  if (!created.sha) {
    return {
      ok: false,
      error: { kind: "unexpected", status: 0, detail: "commit not created" },
    };
  }

  // 5. Fast-forward the branch. force:false is the concurrency guard.
  const updateResult = await request(
    repoPath(config, `/git/refs/heads/${encodeURIComponent(branch)}`),
    token,
    {
      method: "PATCH",
      body: JSON.stringify({ sha: created.sha, force: false }),
    },
  );
  if (!updateResult.ok) return updateResult;

  return {
    ok: true,
    value: {
      sha: created.sha,
      url:
        created.html_url ??
        `https://github.com/${config.githubRepo}/commit/${created.sha}`,
    },
  };
}

/* ── helpers ───────────────────────────────────────────────────────────── */

/** Percent-encodes each segment but keeps the slashes that structure the path. */
function encodeContentPath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

function decodeBase64(value: string): string {
  // GitHub wraps base64 content at 60 chars; atob rejects the newlines.
  const clean = value.replace(/\s/g, "");
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/** Human-readable, non-leaky rendering of a GitHubError for the admin UI. */
export function describeError(error: GitHubError): string {
  switch (error.kind) {
    case "auth":
      return "GitHub rejected the session. Sign out and sign in again.";
    case "not_found":
      return "The repository or branch could not be found. Check GITHUB_REPO and GITHUB_BRANCH.";
    case "conflict":
      return "The branch moved while you were editing — someone else published. Reload and reapply your change.";
    case "rate_limited": {
      const seconds = error.retryAfterSeconds;
      if (!seconds) return "GitHub rate limit reached. Try again shortly.";
      // Secondary limits are typically a 60s retry-after, and "1 minutes" reads
      // like a bug in the very message meant to reassure.
      if (seconds < 90) {
        return "GitHub rate limit reached. Try again in about a minute.";
      }
      return `GitHub rate limit reached. Try again in about ${Math.ceil(seconds / 60)} minutes.`;
    }
    case "network":
      return "Could not reach GitHub. Check the server's connectivity and try again.";
    case "unexpected":
      return `GitHub returned an unexpected response (${error.status}).${error.detail ? ` ${error.detail}` : ""}`;
  }
}
