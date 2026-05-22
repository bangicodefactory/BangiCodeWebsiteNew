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

`DESIGN.md` (in the Company brand library repo) is the brand source of truth for colors, typography, radii, spacing. **Tokens reach `next-app/` THROUGH the Company brand registry** — they're not authored locally in this repo. The local CLAUDE.md token drift table below is preserved as a sanity check against the Stitch prototype, but the actual `@theme` values flow in via installed registry components. See "Component library — Company brand registry" below.

---

## Token source of truth — DESIGN.md, NOT the prototype

The Stitch HTML prototype has drifted color and borderRadius values. **DESIGN.md** (in the library repo) is canonical. The token CSS reaches `next-app/` through the registry — but if you're reading the prototype to plan structure, verify any color/radius reference against this table first. Known deltas:

| Token | Prototype (wrong) | DESIGN.md (correct) |
|---|---|---|
| `primary` | `#000c2c` | **`#002058`** |
| `tertiary` | `#280000` | **`#500000`** |
| `secondary-container` | `#80c5fe` | **`#5cb8fd`** |
| `surface-container` | `#eceef4` | **`#e3efff`** |
| `surface-variant` | `#e0e2e8` | **`#d1e4fb`** |
| `borderRadius.full` | `0.75rem` | **`9999px`** (pills, not rounded squares) |
| `borderRadius` scale | DEFAULT 0.125 / lg 0.25 / xl 0.5 | DEFAULT 0.25 / md 0.375 / lg 0.5 / xl 0.75 / full 9999px |

If a token from the prototype isn't in this table, still verify against DESIGN.md before using.

---

## Tech stack rules (don't deviate without writing an ADR)

- **Next.js 16.2.6**, App Router, TypeScript strict.
- **Tailwind v4** with CSS-first `@theme`. NOT Tailwind v3 JS config. NOT the Play CDN. The `@theme` block is **NOT authored locally** — token CSS flows in from the Company brand registry (see "Component library" section below).
- **Components: Company brand shadcn registry** at https://github.com/bangicodefactory/bangicode-design-system. Consumer pulls components via `npx shadcn add @bangicode/<name>`. See `## Component library — Company brand registry` below.
- **Icons:** **lucide-react** only. NOT Material Symbols Outlined (that's what the prototype uses; it loads a 700KB+ font and pulls by string name).
- **i18n:** next-intl with `[locale]` route segments. RTL for AR via `dir="rtl"` on `<html>`.
- **Fonts:** Montserrat (display), Hanken Grotesk (body), JetBrains Mono (technical) via `next/font`. Arabic locale needs a separate subset (Noto Sans Arabic or equivalent) for the display family.
- **Analytics:** GA4, gated by the cookie consent banner (IST-156). NOT Plausible.
- **Booking:** Cal.com via `@calcom/embed-react`.
- **Forms:** React Hook Form + Zod — both come from the library via `@bangicode/form` (already wired upstream).

---

## Component library — Company brand registry

The redesign **consumes** the Bangicode design system as a private shadcn registry. It does NOT re-implement shadcn primitives or author DESIGN.md tokens locally.

- **Source:** https://github.com/bangicodefactory/bangicode-design-system
- **Registry namespace:** `@bangicode`
- **Registry URL (per `components.json`):** `https://design.bangicode.ma/r/<name>.json`
- **Install:** `npx shadcn add @bangicode/<name>` (lands in `next-app/components/ui/<name>.tsx`)
- **Version pin:** `next-app/registry-version.json` records the library's git SHA + `package.json` version + install timestamp. Refreshed each time a component is added or updated. CI fails if the pin is stale > 14 days (IST-123 / IST-200).
- **Companion tickets:** [IST-120](https://linear.app/ista3/issue/IST-120) (consumer-side wiring) · [IST-200](https://linear.app/ista3/issue/IST-200) (consumer-side pin/refresh workflow) · [IST-198](https://linear.app/ista3/issue/IST-198) (library-side version freshness, in the `bangicode component library` project).

**Rules:**

1. **Do not author DESIGN.md tokens or a `@theme` block locally.** They ship in through the installed components and a thin `app/globals.css` import. The library is the bridge from DESIGN.md to Tailwind v4.
2. **Do not modify installed component source.** If a registry component doesn't meet a real need, file an upstream issue on the library repo. Page-level wrappers that compose registry components are fine; patching `components/ui/<name>.tsx` is not.
3. **Consumer-specific sections** (StudioStatusPanel, ThesisLineStats, RentCarFeaturedCase, PeekCards, WhatHappensNext, FounderCard, TrustedByRow) live in `next-app/components/sections/` per IST-199. They use ONLY library token classes — no raw hex except the documented `tertiary-fixed-dim #ffb4a9` for the online dot.
4. **Pulling updates** from the library: re-run `npx shadcn add @bangicode/<name>` for components you want to refresh. Read the diff before committing. Update `registry-version.json`. The smoke gallery (`/_smoke`, IST-129) is the verification surface.
5. **Components the library ships** (per v0.1.0 CHANGELOG): Button · Card · Input · Textarea · Select · Label · Checkbox · Radio group · Switch · Form (RHF+Zod) · Dialog · Dropdown menu · Popover · Sheet · Tabs · Accordion · Alert · Toast (Sonner) · Tooltip · Badge · Separator · Avatar · Skeleton · Sidebar nav · Data table (TanStack) · Charts (Recharts) · Stats card · Breadcrumb · Pagination · Hero · Feature grid · Pricing table · CTA · Testimonials · Logo cloud · FAQ · Site footer.
6. **NOT in the library** (must be built consumer-side): NavigationMenu (IST-127), the IST-199 bespoke sections, and any other page-specific composition.

---

## Locked content decisions

- **Legal entity:** Bangicode SARL.
- **Copyright line:** `© 2020–2026 Bangicode SARL. Crafted with Moroccan precision.`
- **Footer services list:** Custom software / E-commerce / Technical training / Social presence. (NOT the generic "Web Development / Mobile Solutions / UI/UX Strategy / Cloud Systems" that Stitch hallucinated.)
- **Testimonials:** keep the Youssef B. / Friterie.ma placeholder. Mark it `data-placeholder="true"` so it's grep-able.
- **Case studies:** short 1-screen summaries with "Full case study available on request — contact us" CTA. NOT long-form.
- **Studio status panel `● online` indicator:** uses **tertiary-fixed-dim (`#ffb4a9`)** — the single legitimate use of tech-red. Stitch drifted to sky-blue; do not match Stitch on this one.
- **Hero CTA naming:** "Start a project" everywhere (in both nav and body). NOT "Let's Build" (Stitch swap).

---

## Workflow conventions

- **Branch naming:** `ahmedchioua/ist-<NN>` (Linear suggests this automatically per ticket).
- **Commit messages:** include the ticket reference, e.g., `IST-119: scaffold Next.js + Tailwind v4 + shadcn`.
- **PRs:** link back to the Linear ticket. Linear's GitHub integration auto-moves the ticket state.
- **Don't delete `bangicode-website/`** (the old CRA app). It stays runnable until E8 cutover (IST-163).
- **New project lives at `next-app/`** (or similar) at the repo root, not inside `bangicode-website/`.

---

## Linear workspace

- **Workspace:** `ista3`
- **Team:** `ISTA3` (key `IST`)
- **Project:** [bangicode.ma redesign](https://linear.app/ista3/project/bangicodema-redesign-9a74ccf5c4b9/overview)
- **Labels in use:** `shadcn-ui`, `migration`, `perf`, `docs`, `Feature`, `Improvement`, `Bug`, `i18n`, `copy`, `legal`, `a11y`, `design`, `seo`.
- **Active milestones:** E1 → E8, target dates 2026-05-22 through 2026-06-12.

---

## What lives where

- `REDESIGN_PLAN.md` — full plan. Read the sections each ticket references.
- `DESIGN.md` — brand tokens. Source of truth for `@theme`.
- `brand/` — brand assets (logo, future icon variants). See "Brand assets" below.
- `prototypes/v4-stitch.html` — structure reference. NOT a code source.
- `bangicode-website/` — current production site (CRA build, runs until cutover).
- `next-app/` — new production site (build target — create in IST-119).

---

## Brand assets — `brand/`

The canonical brand source lives at `brand/` in the repo root. When IST-119 scaffolds `next-app/`, copy these into `next-app/public/brand/` and reference them from there in components.

### `brand/logo.svg`

Wordmark. **2039 × 314** (wide horizontal, ~6.5:1 aspect). Use this for the top nav, the footer brand block, and the OG image.

**The logo's hex colors are intentionally different from `DESIGN.md` tokens — DO NOT repaint them.** The logo is an immutable brand artifact; DESIGN.md tokens drive UI surfaces, the logo stays as-is. The colors used inside the SVG:

| Logo fill | Approximate DESIGN.md analog | Note |
|---|---|---|
| `#114483` / `#124482` / `#124483` / `#124484` | ≈ `primary-container` (`#1A3673`) | Wordmark navy |
| `#2A89C8` / `#2E8FCD` / `#2E91CE` / `#2F92CF` | ≈ `secondary` (`#006397`) / `secondary-container` (`#5cb8fd`) | Wordmark sky-blue |
| `#D30F33` / `#B20F2E` / `#AC0F2D` | ≈ `tertiary` family — the "S" tech-red detail | Single legitimate place tech-red appears in brand |

If a design asks for the logo to "match the theme," resist. The drift is by design — the logo holds its own color identity against any UI palette tweaks.

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
- All interactive elements get a 2px sky-blue focus ring (DESIGN.md §Elevation).
- `prefers-reduced-motion` respected.
