# Bangicode.ma redesign — project context for Claude Code

This file loads automatically at the start of every Claude Code session in this directory. It points at the canonical references and lists the rules that apply to every ticket. Read it before doing anything else.

---

## Before starting any task — do these three things in order

### 1. Read the assigned Linear ticket

Issues live at `https://linear.app/ista3/issue/IST-<NN>`. The Linear MCP is connected — use `mcp__bc225903-1a8b-4307-a0b4-610ac85a9e85__get_issue` with the `IST-NN` identifier (or the issue URL). Acceptance criteria sit in the description under `## Acceptance criteria`.

### 2. Read these two files in this order

- **`REDESIGN_PLAN.md`** — the canonical plan. At minimum read:
  - **§1** (locked decisions — stack, fonts, analytics, copyright, legal entity, etc.)
  - **§1A** (canonical Stitch visual reference URL + moves to honor)
  - **§1B** (deltas to reconcile from the Stitch HTML prototype — see "Token source of truth" below)
  - **§4** (design system wiring — now thin: registry consumption, not local `@theme` authoring)
  - Any other section referenced in the ticket's `## References`.
- **`prototypes/v4-stitch.html`** — **structure reference only**. Section order, layout intent, copy. **Do NOT copy its Tailwind config or color values** — they have drifted from DESIGN.md, and `@theme` isn't authored locally anyway (registry ships it).

### 2b. If the ticket touches components

Read **`## Component library — Company brand registry`** below before doing anything. Components come from `@bangicode/<name>` via `npx shadcn add`, not from re-implementing shadcn primitives. If you find yourself authoring `components/ui/button.tsx`, you're doing the wrong thing — install it from the registry.

### 3. Confirm token source of truth

Tokens are authored **locally** in `bangicodecurrent/src/styles/tokens.css`, imported by `globals.css`. See "Token source of truth" below and [ADR 0001](docs/adr/0001-adopt-claude-design-system-tokens.md).

---

## Token source of truth — `bangicodecurrent/src/styles/tokens.css`

**Changed 2026-08-05 — see [ADR 0001](docs/adr/0001-adopt-claude-design-system-tokens.md).**

The canonical palette is the **Claude Design System** ("bangicode Design System" project, proposal *D · Full brief (trilingual)*). Its three brand anchors are the same colours as the fills inside `brand/logo.svg`:

| Token | Hex | Role |
|---|---|---|
| `--navy-700` | **`#114483`** | Structure — primary buttons, dark sections, headings on light |
| `--sky-500` | **`#2E91CE`** | Accent — links, eyebrows, highlights, focus rings |
| `--red-500` | **`#D30F33`** | The spark — one accent word, a key metric, the active dot, primary CTA |

Plus cool blue-tinted neutrals `--ink-50…950`, and ramps for navy / sky / red. Semantic status: success `#1f9d6b`, warning `#e0922f`, danger = brand red, info = sky.

**Pairing rule: blue does the structure, red does the spark.** If a layout is more than ~5% red, it's wrong.

Shape / depth / motion:

| Aspect | Value |
|---|---|
| Radii | buttons & inputs `10px`, cards `14px`, feature panels `20–28px`, pills `9999px` |
| Borders | 1px cool-grey hairlines; brand emphasis 2–3px navy or spark-red rule |
| Shadows | soft and **navy-tinted** (`rgb(17 68 131 / α)`), never neutral black; `--shadow-brand` / `--shadow-spark` glows |
| Motion | `--ease-out` entrances, `--ease-spring` micro-interactions; 120 / 200 / 360ms |
| Focus | **3px** sky soft ring, never removed |
| Layout | 12-col mental model, max content width **1320px**, 4px spacing scale |

**Both semantic vocabularies are live and must stay mapped.** Components mix shadcn names (`foreground`, `muted-foreground`, `card`, `ring`, `accent`, `destructive`) with Material-3 names (`on-surface`, `outline`, `surface-container`, `primary-container`, `on-error-container`). `tokens.css` defines both. If you add a token, add it to both vocabularies or you'll get a silently unstyled element.

**`DESIGN.md` is superseded for colour** (it specified `#002058` primary, `#5cb8fd` secondary-container, `#500000` tertiary). It stays in the repo for history only. `prototypes/v4-stitch.html` is no longer the visual reference either — the Claude Design project is.

---

## Tech stack rules (don't deviate without writing an ADR)

- **Next.js 16.2.6**, App Router, TypeScript strict.
- **Tailwind v4** with CSS-first `@theme`. NOT Tailwind v3 JS config. NOT the Play CDN. The `@theme` block **IS authored locally**, in `bangicodecurrent/src/styles/tokens.css` (imported by `globals.css`) — see ADR 0001.
- **Components:** shadcn-style primitives live in `bangicodecurrent/src/components/ui/`. The `@bangicode` registry at `design.bangicode.ma` was never deployed; do not wait on it. See `## Component library` below.
- **Icons:** **lucide-react** only, 2px stroke. 16px inline with text, 20px in buttons/nav, 24px feature. NOT Material Symbols Outlined (that's what the prototype uses; it loads a 700KB+ font and pulls by string name).
- **i18n:** next-intl with `[locale]` route segments. RTL for AR via `dir="rtl"` on `<html>`.
- **Fonts:** **Chakra Petch** (display), **Manrope** (body), **JetBrains Mono** (technical) via `next/font`. For `ar`, **IBM Plex Sans Arabic** replaces BOTH display and body — Chakra Petch and Manrope have no Arabic coverage. One family covers both roles to keep `/ar` to a single extra download.
- **Font stacks are indirected** through `--font-display-stack` / `--font-body-stack` / `--font-mono-stack` in `tokens.css`. Do NOT point a utility straight at a `next/font` variable via `@theme inline` — `inline` bakes the value into the utility, so any `[lang=…]` override silently stops working and Tailwind drops the rule. That bug shipped twice.
- **Analytics:** GA4, gated by the cookie consent banner (IST-156). NOT Plausible.
- **Booking:** Cal.com via `@calcom/embed-react`.
- **Forms:** React Hook Form + Zod — both come from the library via `@bangicode/form` (already wired upstream).

---

## Component library

**Changed 2026-08-05 — see [ADR 0001](docs/adr/0001-adopt-claude-design-system-tokens.md).**

The `@bangicode` private shadcn registry at `https://design.bangicode.ma/r/<name>.json` **was never deployed** — the endpoint 404s, and `bangicodecurrent/registry-version.json` records `"status": "pending"` with no install timestamp. Do not block work on it.

Primitives live locally in `bangicodecurrent/src/components/ui/`: badge · button · card · checkbox · form (RHF+Zod) · input · label · radio-group · select · separator · sheet · switch · textarea. Add new ones in the same style, on tokens from `src/styles/tokens.css`.

**Rules:**

1. **Author tokens in `bangicodecurrent/src/styles/tokens.css`.** Keep them in that file rather than inline in `globals.css`, so there's a single seam to remove if a real registry ever ships. Define every token in **both** semantic vocabularies (shadcn + Material-3) — see "Token source of truth" above.
2. **Prefer editing a primitive over forking it.** A page-level wrapper that composes primitives is fine; a near-duplicate of `ui/<name>.tsx` is not.
3. **Consumer-specific sections** (ThesisLineStats, FeaturedCase, PeekCards, WhatHappensNext, FounderCard, TrustedByRow, WhyBangicode, SolutionsSection, FaqSection) live in `bangicodecurrent/src/components/sections/`. They use **only** token classes — **no raw hex**. StudioStatusPanel was removed on 2026-08-14 along with its `● online` dot and `LocalClock`, which had no other consumer; the retired `#ffb4a9` exception went with it.
4. **The smoke gallery** (`src/app/smoke/`, gated by `SMOKE_GALLERY=1`) is the per-section verification surface. Add a page when you add a section, register it in the `SECTIONS` list in `src/app/smoke/page.tsx`, and remove both when you drop one. Note it is a **separate root layout** — it inherits nothing from `[locale]/layout.tsx`, so `smoke/layout.tsx` must keep its own `globals.css` import and font variables (ADR 0001, bug 5).
5. **`pnpm check:registry-pin`** guards a registry we no longer consume. Disable or repoint it — tracked separately.
6. **Still to build consumer-side:** NavigationMenu (IST-127, already bespoke in `components/nav/`) and any page-specific composition. An `Accordion` primitive is **not** needed — `FaqSection` uses native `<details>`/`<summary>`, which gives the disclosure semantics and keyboard handling for free and keeps the section off the client bundle (ADR 0001).

---

## The CMS — `/admin`

**Added 2026-08-06 — see [ADR 0002](docs/adr/0002-git-backed-cms.md).**

A git-backed CMS for blog posts and portfolio projects, built on the same tokens
as the public site. Sign-in is GitHub OAuth restricted to active members of the
`bangicodefactory` org; publishing commits to the repo and the site rebuilds.

**Changed 2026-08-07 — see [ADR 0003](docs/adr/0003-mysql-backed-cms.md).** Content
lives in **MySQL**, not in git, and sign-in is a **local account**, not GitHub
OAuth. ADR 0002 still explains the shape of the admin and why atomic
multi-locale writes matter; its storage and auth decisions are superseded.

| Rule | Why |
|---|---|
| **Never generate TypeScript from the CMS.** Content is rows, read through `src/lib/content/*`. | A bad write must be a bad page, not a broken build. |
| **Editorial copy does not live in `messages/*.json`.** | Those are UI strings, guarded by `check:messages`. Project copy lives in `project_translations`. |
| **All three locales publish in ONE transaction.** | A half-published post renders in one language and 404s in another. |
| **Every server action calls `requireSession()` first.** | Actions are POST endpoints reachable directly; middleware only guards navigations. |
| **Nothing but identity in the session.** It stays an AES-GCM sealed cookie with no server-side store. | It is what lets middleware verify at the Edge with no DB round trip. Adding a DB lookup there would break the Edge guard. |
| **Pass `toAdminUser(session)` to components, never `session`.** | Structural typing lets extra fields ride along; a future `"use client"` would serialise them to the browser. |
| **Publishing calls `revalidateTag`.** | Content routes are cached; without invalidation a publish is invisible until the cache expires. |
| **Passwords are hashed with `scrypt` from `node:crypto`.** Never add argon2/bcrypt. | They ship native binaries — the same class of dependency that made `@mdx-js/mdx` fail only in CI. |
| **Editor inputs are controlled.** | React 19 resets `<form action>` after the action — uncontrolled fields lose the author's work on a validation error. |
| **`/admin` is a separate root layout** and must keep its own `globals.css` import + font variables. | Same trap as `/smoke` (ADR 0001, bug 5). |
| Client components import `@/lib/portfolio-schema`, never a loader. | Loaders reach the database and fail the client build. |
| `content/portfolio/*.json` and `content/blog/**` are **seed fixtures**, not the live source. | CI and local dev seed from them; the site reads the database. |

Env vars are documented in `bangicodecurrent/.env.example`; `/admin/login` names any that
are missing rather than crashing. Tests: `pnpm test:cms` (a real MySQL, seeded
per run — never a production database).

---

## Locked content decisions

- **Legal entity:** Bangicode SARL.
- **Copyright line:** `© 2020–2026 Bangicode SARL. Crafted with Moroccan precision.`
- **Footer services list:** Custom software / E-commerce / Technical training / Social presence. (NOT the generic "Web Development / Mobile Solutions / UI/UX Strategy / Cloud Systems" that Stitch hallucinated.)
- **Testimonials:** keep the Youssef B. / Friterie.ma placeholder. Mark it `data-placeholder="true"` so it's grep-able.
- **Case studies:** short 1-screen summaries with "Full case study available on request — contact us" CTA. NOT long-form.
- **Hero CTA naming:** "Start a project" everywhere (in both nav and body). NOT "Let's Build" (Stitch swap).

---

## Workflow conventions

- **Branch naming:** `ahmedchioua/ist-<NN>` (Linear suggests this automatically per ticket).
- **Commit messages:** include the ticket reference, e.g., `IST-119: scaffold Next.js + Tailwind v4 + shadcn`.
- **PRs:** link back to the Linear ticket. Linear's GitHub integration auto-moves the ticket state.
- **Don't delete `old-website/`** (the old CRA app). It stays runnable until E8 cutover (IST-163).
- **New project lives at `bangicodecurrent/`** (or similar) at the repo root, not inside `old-website/`.

---

## Linear workspace

- **Workspace:** `ista3`
- **Team:** `ISTA3` (key `IST`)
- **Project:** [bangicode.ma redesign](https://linear.app/ista3/project/bangicodema-redesign-9a74ccf5c4b9/overview)
- **Labels in use:** `shadcn-ui`, `migration`, `perf`, `docs`, `Feature`, `Improvement`, `Bug`, `i18n`, `copy`, `legal`, `a11y`, `design`, `seo`.
- **Active milestones:** E1 → E8, target dates 2026-05-22 through 2026-06-12.

---

## What lives where

**Renamed 2026-08-31.** `next-app/` → **`bangicodecurrent/`** and
`bangicode-website/` → **`old-website/`**. Both moved with `git mv`, so
`git log --follow` still reaches the full history of every file.

If you are reading an older doc, a Linear ticket or a commit message that says
`next-app/`, it means `bangicodecurrent/`. Anything that says
`bangicode-website/` means `old-website/`.

> The archived app is `old-website`, hyphenated, **not** `old website` with a
> space. Directory names are consumed by shell (`cd bangicodecurrent && pnpm
> lint-staged` in `.husky/pre-commit`), by YAML (`working-directory:` and the
> `paths:` trigger in `ci.yml`) and by `rsync` in the deploy. A space in any of
> those is a quoting bug waiting to happen, and the deploy runs
> `rsync --delete`.

- `REDESIGN_PLAN.md` — full plan. Read the sections each ticket references.
- `DESIGN.md` — brand tokens. Source of truth for `@theme`.
- `brand/` — brand assets (logo, future icon variants). See "Brand assets" below.
- `prototypes/v4-stitch.html` — structure reference. NOT a code source.
- `old-website/` — the retired CRA build. Kept runnable as the cutover rollback.
- `bangicodecurrent/` — the production Next.js app. This is the build target.

---

## Brand assets — `brand/`

The canonical brand source lives at `brand/` in the repo root. When IST-119 scaffolds `bangicodecurrent/`, copy these into `bangicodecurrent/public/brand/` and reference them from there in components.

### `brand/logo.svg`

Wordmark. **2039 × 314** (wide horizontal, ~6.5:1 aspect). Use this for the top nav, the footer brand block, and the OG image.

**DO NOT repaint the logo.** It is an immutable brand artifact. As of ADR 0001 this is no longer a source of tension: the UI palette was moved *onto* the logo's colours, so they now agree.

| Logo fill | Token | Note |
|---|---|---|
| `#114483` / `#124482` / `#124483` / `#124484` | **`--navy-700`** | Wordmark navy — exact match |
| `#2A89C8` / `#2E8FCD` / `#2E91CE` / `#2F92CF` | **`--sky-500`** | Wordmark sky-blue — exact match on `#2E91CE` |
| `#D30F33` / `#B20F2E` / `#AC0F2D` | **`--red-500`** | The "S" spark — exact match on `#D30F33` |

The old `DESIGN.md` palette (`#002058` / `#006397` / `#500000`) drifted away from these; that drift is now resolved in the UI's favour. Still never edit the SVG's fills — the near-duplicate shades above (`#124482`, `#2A89C8`, …) are anti-banding detail in the artwork, not tokens.

### Variants still needed (open — out of scope for IST-119, but track)

- **Square / icon mark** for favicon, app icons, OG fallback when the 6.5:1 wordmark can't fit. Likely the "S" alone in tech-red on a navy field — ask the designer.
- **Monochrome / single-color** versions for ink-on-paper print contexts (e.g., invoices, contracts).
- **Inverted** version for dark backgrounds where the navy wordmark wouldn't read.

When these arrive, drop them in `brand/` alongside `logo.svg` with self-describing names (e.g., `logo-icon.svg`, `logo-mono.svg`, `logo-inverted.svg`) and update this section.

### Usage rules

- Use `next/image` or a static `<img>` with width/height set explicitly (CLS budget is < 0.05 — never let the logo cause layout shift).
- Top-nav rendered height ~24-32px; footer brand block similar. Keep horizontal padding around it (≥ 1× the cap height as visual breathing room).
- Never embed the logo as a CSS `background-image` with `currentColor` tricks — that breaks the embedded fills.
- Alt text: `"Bangicode"` (locale-agnostic — the wordmark is a proper noun).

---

## Performance & accessibility budgets (enforced in CI from IST-123)

- LCP < 2.0s mobile from EU/MENA.
- INP < 200ms · CLS < 0.05.
- Initial JS < 150KB gzipped per route.
- Lighthouse Perf / A11y / SEO / BP ≥ 95 each.
- WCAG 2.2 AA across every page.
- All interactive elements get a **3px** sky-blue focus ring (`--ring-focus`, ADR 0001). Never removed.
- `prefers-reduced-motion` respected.
- Touch targets ≥ 24×24 (WCAG 2.2 **2.5.8**). Stacked mono links in the footer need explicit vertical padding to clear it.
- One `<main id="main-content">` per page, owned by `[locale]/layout.tsx`. Pages render `<div>`s — do not add another `<main>` or reuse the id.
- **`pnpm check:messages`** guards `messages/{en,fr,ar}.json`: identical key sets, no empty values, no English left in `fr`/`ar`. next-intl renders the key path itself on a miss, so a gap ships silently — CI runs this in the "Integrity" job.
