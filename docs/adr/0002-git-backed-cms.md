# ADR 0002 — A git-backed CMS, and moving editorial content out of code

**Status:** accepted · **Date:** 2026-08-06 · **Supersedes:** nothing · **Related:** [ADR 0001](0001-adopt-claude-design-system-tokens.md)

## Context

The studio needs to publish blog posts and add/remove portfolio projects without
a developer editing source files.

Before this change a single project lived in **four** places:

| # | Location | Carried |
|---|---|---|
| 1 | `src/app/[locale]/portfolio/projects.ts` | slug, category, tags, date |
| 2 | `messages/{en,fr,ar}.json` → `Work.<key>{Name,Summary,Outcome}` | 9 strings |
| 3 | `content/work/manifest.json` | hero image metadata |
| 4 | `content/work/en/*.mdx` | nothing — dead, nothing imported it |

Blog posts were already clean: one MDX file per locale under `content/blog/`.

## Decision

**1. Git-backed, not database-backed.** The admin UI commits content files to the
repository through the GitHub API; the deploy rebuilds. No database, no new
hosted dependency, content stays version-controlled and reviewable in diffs, and
the site keeps prerendering (105 static pages today) — which is what protects the
LCP < 2.0s budget. The cost is publish latency of one build, which for a studio
publishing occasionally is the right trade.

**2. A CMS must never generate TypeScript.** `projects.ts` was a source file: a
malformed write is a broken build, not a bad page. Projects now live one-per-file
in `content/portfolio/<slug>.json`, carrying all three locales. The CMS writes
and deletes whole files, atomically, and `src/lib/portfolio.ts` validates every
file against a Zod schema at load.

**3. Editorial content leaves the message catalogs.** The 36 per-project keys
(12 × Name/Summary/Outcome) moved out of `messages/*.json`. `Work` drops from 52
keys to 16 — filters, labels, headings. This sharpens `check-messages-parity`,
which should police UI chrome that must be complete in every locale, not
case-study prose whose completeness is a content decision.

**4. All three locales required to publish** (user decision). Enforced by the Zod
schema, not by the parity guard: `contentSchema` is built from
`routing.locales`, so adding a locale fails every existing project file loudly at
build time rather than silently rendering a slug to visitors of the new locale.

**5. Auth is GitHub OAuth**, restricted to the `bangicodefactory` org. No password
to store or rotate, and commits carry a real author — whoever can commit can
publish. Sessions are stateless: an AES-GCM encrypted, httpOnly cookie.

## Consequences

- Publishing takes a rebuild, not a page refresh.
- `content/work/manifest.json` and `src/lib/work-manifest.ts` are deleted; hero
  metadata moved into each project file.
- `content/work/en/*.mdx` remains on disk and is now definitively orphaned. Left
  in place rather than deleted — removing content is the owner's call.
- `hero.alt` is shared across locales rather than translated. It is currently
  inert (every hero is `placeholder: true`, and the placeholder branch renders
  the project name), but it must become per-locale before real screenshots land.
- The loader **throws** on an invalid content file rather than skipping it. A
  project silently vanishing from the portfolio is precisely the failure class
  this codebase keeps getting bitten by (see ADR 0001's six bugs); a bad file
  should fail the build at the point of the mistake.

## Alternatives rejected

**Database-backed (Postgres + Drizzle).** Instant publish and better drafts, but
it adds a hosted dependency, requires migrating 12 projects × 3 locales out of
code, and takes the portfolio and blog off static rendering unless on-demand
revalidation is wired — putting the perf budget at risk for content that changes
a few times a month.

**Off-the-shelf (Sanity / Decap / Tina).** Least code, but the admin UI would not
be built on the bangicode design system, which was the explicit ask.

**Writing files directly to disk.** Possible on the chosen self-hosted VPS, and
simpler — but the content would then live only on that server, outside version
control, with no review, no history and no rollback.

---

## How it is verified

Two Playwright configs, deliberately:

| Config | Server | Guards |
|---|---|---|
| `playwright.config.ts` | CMS **unconfigured** | The public site, and that every `/admin` path is denied when no secret is set. This is what CI and a fresh checkout look like. |
| `playwright.cms.config.ts` | CMS configured + **stub GitHub** | Publish, edit and delete flows, asserted against the commits the stub records. |

Configuring the server in the first run would invert the meaning of
`admin-auth.spec.ts`, which asserts the unconfigured state — hence the split.

`e2e/support/stub-github.mjs` implements only the endpoints
`src/lib/admin/github.ts` calls, and logs every commit so a test can assert what
*would* have been pushed. It is a fake of GitHub's **shape**, not its semantics:
rate limits, permission edge cases and payload limits remain unverified until
the CMS is pointed at a real repository.

Properties currently under test:

- an incomplete post is refused **and commits nothing**
- a rejected submit does not discard the author's work
- a field's error clears as soon as it is fixed
- publishing writes every locale in **one** commit, layered on `base_tree`,
  attributed to the signed-in person
- editing a project touches one file and leaves untouched locales intact
- deleting requires typing the slug, then removes every locale at once
- a duplicate slug is refused rather than overwriting
- the commit layer never forces the ref, and never leaks the access token
  (`e2e/admin-github.spec.ts`, verified by deliberately breaking the
  implementation three ways and confirming each goes red)

## Bugs this work surfaced

**React 19 resets `<form action={…}>` after the action resolves.** The editors
originally used uncontrolled inputs, so a rejected validation wiped everything
typed — a post written in three languages, gone on the first "the Arabic
description is missing". Both editors are now fully controlled. Static checks
were all green; only driving the UI found it.

**`public/robots.txt` shadowed `src/app/robots.ts`** (pre-existing). Static files
in `public/` win over App Router routes, so the generated robots — the one with
the `Sitemap:` line — had never been served. Deleted.

**The middleware failed open.** The unconfigured branch returned `next()` so
`/admin` could render setup instructions, which meant a server deployed without
`ADMIN_SESSION_SECRET` had a completely open admin. No session can exist without
a secret to seal it, so unconfigured now denies.

**A client component importing the fs-backed loader** failed the build with an
unnamed Turbopack chunk error. Hence `src/lib/portfolio-schema.ts`, which holds
the contract both sides share.

## Known gaps

- Never exercised against the real `api.github.com`.
- No preview of a post before it goes live; the editor is the only view.
- No draft state — the model is "complete in three languages, or not published".
- `server-only` is not installed (it would turn the Turbopack error above into a
  clear message); adding it needs `pnpm`, not `npm`, to keep the lockfile in sync.
