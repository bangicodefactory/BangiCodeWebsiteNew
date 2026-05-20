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
  - **§4** (design system wiring — Tailwind v4 `@theme` block, shadcn variable bridge)
  - Any other section referenced in the ticket's `## References`.
- **`prototypes/v4-stitch.html`** — **structure reference only**. Section order, layout intent, copy. **Do NOT copy its Tailwind config or color values** — they have drifted from DESIGN.md.

### 3. Confirm token source of truth

`DESIGN.md` (repo root) is the brand source of truth for colors, typography, radii, spacing. When wiring `@theme` in Tailwind v4, port from DESIGN.md frontmatter, **not** from the prototype.

---

## Token source of truth — DESIGN.md, NOT the prototype

The Stitch HTML prototype has drifted color and borderRadius values. **Always port from `DESIGN.md`.** Known deltas:

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
- **Tailwind v4** with CSS-first `@theme` block. NOT Tailwind v3 JS config. NOT the Play CDN.
- **shadcn/ui** with custom variants that match DESIGN.md (see §4).
- **Icons:** **lucide-react** only. NOT Material Symbols Outlined (that's what the prototype uses; it loads a 700KB+ font and pulls by string name).
- **i18n:** next-intl with `[locale]` route segments. RTL for AR via `dir="rtl"` on `<html>`.
- **Fonts:** Montserrat (display), Hanken Grotesk (body), JetBrains Mono (technical) via `next/font`. Arabic locale needs a separate subset (Noto Sans Arabic or equivalent) for the display family.
- **Analytics:** GA4, gated by the cookie consent banner (IST-156). NOT Plausible.
- **Booking:** Cal.com via `@calcom/embed-react`.
- **Forms:** React Hook Form + Zod.

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
- `prototypes/v4-stitch.html` — structure reference. NOT a code source.
- `bangicode-website/` — current production site (CRA build, runs until cutover).
- `next-app/` — new production site (build target — create in IST-119).

---

## Performance & accessibility budgets (enforced in CI from IST-123)

- LCP < 2.0s mobile from EU/MENA.
- INP < 200ms · CLS < 0.05.
- Initial JS < 150KB gzipped per route.
- Lighthouse Perf / A11y / SEO / BP ≥ 95 each.
- WCAG 2.2 AA across every page.
- All interactive elements get a 2px sky-blue focus ring (DESIGN.md §Elevation).
- `prefers-reduced-motion` respected.
