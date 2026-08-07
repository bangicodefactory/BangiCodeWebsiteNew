/*
 * A minimal stand-in for the GitHub REST API, so the CMS can be exercised
 * end-to-end without a real repository, real credentials, or a network.
 *
 * It implements only what src/lib/admin/github.ts actually calls:
 *   GET  /user                              identity
 *   GET  /user/memberships/orgs/:org        org membership
 *   GET  /repos/:o/:r/contents/*            read file or list directory
 *   GET  /repos/:o/:r/git/ref/heads/:branch branch head
 *   GET  /repos/:o/:r/git/commits/:sha      that commit's tree
 *   POST /repos/:o/:r/git/trees             new tree
 *   POST /repos/:o/:r/git/commits           new commit
 *   PATCH /repos/:o/:r/git/refs/heads/:b    fast-forward the branch
 *
 * Every commit is appended to STUB_COMMIT_LOG so a test can assert what WOULD
 * have been pushed — how many commits, which paths, what content. That is the
 * point: the properties worth guarding (one commit per publish, three files in
 * it, deletions expressed as deletions) are invisible from the UI alone.
 *
 * Not a fake of GitHub's semantics — just its shape. Rate limits, permissions
 * and payload limits are real-world concerns this cannot cover.
 */
import { createServer } from "node:http";
import { writeFileSync } from "node:fs";

const PORT = Number(process.env.STUB_GITHUB_PORT ?? 4599);
const LOG = process.env.STUB_COMMIT_LOG ?? "";

/** In-memory repository: path -> file text. */
const files = new Map();
const commits = [];
let headSha = "HEAD0";
let counter = 0;
let pendingTree = null;

function seed() {
  for (const locale of ["en", "fr", "ar"]) {
    files.set(
      `content/blog/${locale}/seeded-post.mdx`,
      `---\ntitle: Seeded (${locale})\ndescription: A post that already exists\ndate: '2026-08-01'\n---\n\nSeeded body.\n`,
    );
  }
  files.set(
    "content/portfolio/rentcar.json",
    JSON.stringify(
      {
        slug: "rentcar",
        order: 1,
        category: "software",
        tags: ["Laravel", "Next.js"],
        date: "2023",
        hero: {
          placeholder: true,
          webp: "/case-studies/rentcar/hero.webp",
          alt: "RentCar",
          width: 1600,
          height: 900,
        },
        content: {
          en: {
            name: "RentCar",
            summary: "EN summary.",
            outcome: "EN outcome.",
          },
          fr: {
            name: "RentCar",
            summary: "FR résumé.",
            outcome: "FR résultat.",
          },
          ar: { name: "RentCar", summary: "ملخص.", outcome: "نتيجة." },
        },
      },
      null,
      2,
    ) + "\n",
  );
}
seed();

function persist() {
  if (LOG) writeFileSync(LOG, JSON.stringify(commits, null, 2));
}
persist();

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

const b64 = (s) => Buffer.from(s, "utf8").toString("base64");

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const p = decodeURIComponent(url.pathname);

  let raw = "";
  for await (const chunk of req) raw += chunk;
  const body = raw ? JSON.parse(raw) : null;

  // Test hooks — reset state between specs, read the commit log.
  if (p === "/__reset") {
    files.clear();
    commits.length = 0;
    headSha = "HEAD0";
    counter = 0;
    seed();
    persist();
    return json(res, 200, { ok: true });
  }
  if (p === "/__commits") return json(res, 200, commits);

  if (p === "/user")
    return json(res, 200, {
      login: "ahmed",
      name: "Ahmed Chioua",
      avatar_url: "",
    });
  if (p.startsWith("/user/memberships/orgs/"))
    return json(res, 200, { state: "active" });

  const contents = p.match(/^\/repos\/[^/]+\/[^/]+\/contents\/(.*)$/);
  if (contents) {
    const target = contents[1];
    if (files.has(target)) {
      return json(res, 200, {
        type: "file",
        content: b64(files.get(target)),
        sha: "blob-" + target,
      });
    }
    const children = [...files.keys()].filter((f) =>
      f.startsWith(target + "/"),
    );
    if (children.length > 0) {
      return json(
        res,
        200,
        children.map((f) => ({
          name: f.split("/").pop(),
          path: f,
          type: "file",
        })),
      );
    }
    return json(res, 404, { message: "Not Found" });
  }

  if (/\/git\/ref\/heads\//.test(p))
    return json(res, 200, { object: { sha: headSha } });

  // Any commit sha, not just the seeded HEAD — after the first publish the
  // branch head is COMMIT1 and the next publish reads ITS tree.
  if (req.method === "GET" && /\/git\/commits\/[^/]+$/.test(p))
    return json(res, 200, { tree: { sha: "tree-of-" + p.split("/").pop() } });

  if (p.endsWith("/git/trees") && req.method === "POST") {
    counter++;
    const applied = [];
    for (const entry of body.tree) {
      if (entry.sha === null) {
        files.delete(entry.path);
        applied.push({ path: entry.path, deleted: true });
      } else {
        files.set(entry.path, entry.content);
        applied.push({ path: entry.path, content: entry.content });
      }
    }
    pendingTree = { baseTree: body.base_tree, applied };
    return json(res, 200, { sha: "tree-" + counter });
  }

  if (p.endsWith("/git/commits") && req.method === "POST") {
    const sha = "COMMIT" + counter;
    commits.push({
      sha,
      message: body.message,
      author: body.author,
      parents: body.parents,
      baseTree: pendingTree?.baseTree,
      files: pendingTree?.applied ?? [],
    });
    persist();
    return json(res, 200, { sha, html_url: `https://github.test/c/${sha}` });
  }

  if (/\/git\/refs\/heads\//.test(p) && req.method === "PATCH") {
    headSha = body.sha;
    return json(res, 200, { object: { sha: headSha } });
  }

  return json(res, 404, { message: `stub: unhandled ${req.method} ${p}` });
});

server.listen(PORT, () =>
  console.log(`stub-github listening on http://localhost:${PORT}`),
);
