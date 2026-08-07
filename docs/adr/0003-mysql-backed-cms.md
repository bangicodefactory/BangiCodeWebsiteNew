# ADR 0003 — MySQL-backed content, and local accounts instead of GitHub sign-in

**Status:** accepted · **Date:** 2026-08-07 · **Supersedes:** [ADR 0002](0002-git-backed-cms.md) decisions 1 and 5 · **Related:** [ADR 0001](0001-adopt-claude-design-system-tokens.md)

## Context

ADR 0002 chose a **git-backed** CMS: the admin commits JSON and MDX to the
repository through the GitHub API, and a deploy publishes. Sign-in is GitHub
OAuth restricted to the `bangicodefactory` org.

That ADR considered a database and **rejected it**, in these words:

> **Database-backed (Postgres + Drizzle).** Instant publish and better drafts,
> but it adds a hosted dependency, requires migrating 12 projects × 3 locales
> out of code, and takes the portfolio and blog off static rendering unless
> on-demand revalidation is wired — putting the perf budget at risk for content
> that changes a few times a month.

Every clause of that is still true. What changed is not the analysis but the
weighting: the owner wants to publish **without a deploy**, and to sign in
**without a GitHub account**. Those are requirements, not preferences, and the
git-backed design cannot satisfy either — publishing *is* a commit, and the
authorisation model *is* org membership.

So this ADR does not claim the previous one was wrong. It records that two of
its accepted costs stopped being acceptable.

## Decision

**1. Content lives in MySQL.** Blog posts and portfolio projects move to tables;
the database is the one cPanel already provides on the existing Namecheap
shared hosting, so "adds a hosted dependency" costs nothing new to operate and
nothing extra to back up.

SQLite was rejected for a specific reason: the deploy job runs
`rsync -az --delete` over `DEPLOY_PATH`, so a database file inside the
application directory is destroyed on every deploy. Surviving that would mean
storing it outside the app and remembering why forever. MySQL sits outside the
deployed tree by construction.

**2. Sign-in is a local `users` table**, password-authenticated, with per-account
lockout. Accounts are created by a CLI script — there is no self-signup and no
invite flow, because an open registration form on a studio CMS is a liability
and an invite flow needs an email sender the host may not provide.

**Password reset is CLI-only** for now, for the same reason. This is a real gap,
not an oversight: an editor who forgets their password needs someone with shell
access.

**3. The session layer does not change.** It was already a stateless, AES-GCM
sealed cookie carrying **identity only** — no token, no server-side store. That
is what lets `middleware.ts` verify a session at the Edge without a database
round trip, and it is why replacing the *authentication* step is a much smaller
change than replacing the *session*. `src/lib/admin/crypto.ts` and
`session.ts` are untouched.

**4. Reads are cached and invalidated on publish.** Content routes read through
`unstable_cache` with tags; publishing calls `revalidateTag`. The page stays
served from cache, so the perf budget survives, and the change is live in
seconds rather than in a build.

Deliberately **not** `use cache`, which supersedes `unstable_cache` in Next 16:
that directive requires enabling Cache Components globally, which changes how
every dynamic API behaves across all 105 prerendered pages. Flipping a global
rendering flag inside a change that already replaces auth *and* storage is how
this codebase has repeatedly shipped subtle rendering bugs (ADR 0001 catalogues
six). Migrating to `use cache` is a follow-up, on its own, with its own
verification.

**5. Driver is `mysql2`, not an ORM with a native engine.** Prisma ships a
platform-specific query engine binary. That is the same class of dependency that
produced the `@mdx-js/mdx` failure in CI — a module resolvable on a developer
machine and absent where it actually runs. `mysql2` is pure JavaScript and
traces cleanly into the standalone bundle.

## Consequences

### What is lost

- **Version history, diffs and rollback.** Git provided all three for free, and
  ADR 0002 counted them as a reason to choose it. A `content_revisions` table
  snapshots every write, and cPanel backs up the database — but that is a
  replacement, not an equivalent, and **the restore path must be tested before
  it is trusted.**
- **GitHub's 2FA and central revocation.** Previously, removing someone from the
  org ended their access everywhere within one session TTL. Now a password is
  the only thing between the internet and the publish button. Mitigated by
  per-account lockout and a requirement for generated passwords; TOTP is worth
  scheduling.
- **Build-time prerendering of content routes.** The build has no production
  database, and baking CI's content into the bundle would be wrong, so
  `/portfolio`, `/blog` and their detail routes render on first request and
  cache. Everything else still prerenders.

### What is gained

- Publishing no longer requires a deploy.
- The `GITHUB_TOKEN` PAT is revoked. It was a standing write credential to the
  entire repository, held on the server; deleting it removes real standing
  privilege, which is a security improvement independent of the rest.
- **`sort_order` is `UNIQUE` in the schema.** The duplicate-order bug found in
  the review of #57 — where a CMS publish committed cleanly and then broke the
  next build, because `src/lib/portfolio.ts` throws on a duplicate — becomes
  structurally impossible rather than hand-checked in an action.
- Atomicity is enforced by the database. ADR 0002 chose the Git Data API
  specifically so that all three locales land in one commit; a transaction gives
  the same guarantee more directly.

### Operational

- CI now needs a database. The smoke suite and Lighthouse both assert on real
  content (`/en/portfolio/rentcar` appears in `e2e/routes.spec.ts` and
  `.lighthouserc.json`), so those jobs run a `mysql` service container, migrate,
  and seed from the repository's content files.
- The content files under `content/portfolio/` and `content/blog/` **stay in the
  repo** as the seed fixture for CI and local development. They stop being the
  source of truth for the live site.
- The deploy job runs migrations against production **before** restarting
  Passenger.

## Alternatives rejected

**Keeping GitHub OAuth and moving only the content.** Smaller, and it would have
kept 2FA and central revocation. Rejected because the requirement was to stop
needing GitHub accounts at all — solving half of it would have left the
dependency in place for no reduction in work on the other half.

**Postgres.** A better database, and not one cPanel offers on this plan. Adding
a hosted Postgres would reintroduce exactly the "new hosted dependency" cost
that ADR 0002 objected to, in exchange for features this workload does not use.

**Keeping files on disk, writing directly.** Already rejected in ADR 0002 for
good reasons that still hold, and now additionally impossible: `rsync --delete`
would erase anything the CMS wrote between deploys.
