# Bangicode.ma — Complete Redesign Plan

**Status:** Proposal, awaiting review
**Owner:** Ahmed (ahmedchioua@gmail.com)
**Linear workspace:** `ista3` · **Team:** `ISTA3` (key `IST`) · **Project:** [bangicode.ma redesign](https://linear.app/ista3/project/bangicodema-redesign-9a74ccf5c4b9/overview) · **Project ID:** `1e6843fc-668b-4aa0-a793-0befe00ed415`
**Date drafted:** 2026-05-20

---

## 1. Decisions already locked in

| Decision | Choice |
|---|---|
| Framework | **Next.js 16.2.6** (App Router, RSC, image optimization, ISR) |
| Language | **TypeScript** (strict mode) |
| Component library | **Company brand private shadcn registry** at https://github.com/bangicodefactory/bangicode-design-system. Consumer pulls components via `npx shadcn add @bangicode/<name>`. No local re-implementation of shadcn primitives. See §4 + IST-120 + IST-200. |
| Styling | **Tailwind CSS 4**. Token CSS reaches `next-app/` THROUGH the registry — DESIGN.md is authored in the library repo, not here. No local `@theme` block. |
| Animation | **Refined, lightweight motion** — Framer Motion + Tailwind transitions. WebGL/Three.js components (Hyperspeed, LightRays, FloatingLines) **removed**. |
| Copy | **Full rewrite** in EN / FR / AR, plus legal pages (Privacy, Terms, Cookies) |
| i18n | **next-intl** with `[locale]` route segments; RTL for AR |
| Linear tickets | Propose first; do not auto-create |
| Visual reference | **Stitch preview** of Proposal A v3 — see §1A below |
| Legal entity | **Bangicode SARL** (use on copyright line + Terms of Service + Privacy) |
| Copyright line | **© 2020–2026 Bangicode SARL.** |
| Case-study depth | **Short 1-screen summaries** with a *"Full case study available on request"* CTA at the bottom of each. Dramatically smaller scope than originally planned (was 1500–2500 words each). |
| Testimonials | **Keep the Youssef B. / Friterie.ma placeholder** until Ahmed replaces it manually. Production code must mark it `data-placeholder="true"` so it's grep-able. |
| Analytics | **Google Analytics 4** (originally suggested Plausible/Umami; Ahmed picked GA4 — adjust cookie banner consent flow accordingly since GA4 requires opt-in under GDPR). |
| Booking integration | **Cal.com** — powers the founder contact card "Book 30 min →" CTA. Self-hostable open-source option; can also use cal.com hosted. Embed via official `@calcom/embed-react`. |

---

## 1A. Visual reference — canonical Stitch mockup

**URL:** https://stitch.withgoogle.com/preview/5308203603932263226?node-id=2d3ee473fac94b7d8396fd9de7847c73&raw=1

This is the **canonical visual reference** for the redesign. Generated in Google Stitch (stitch.withgoogle.com) from Proposal A v3, which was the final iteration after layering BairesDev and Sumatosoft inspiration on top of `DESIGN.md`.

**Sections in the Stitch render (confirmed working):**

- Top nav with Bangicode wordmark, items: Services / Portfolio / Process / About, EN/FR/AR locale switcher, primary CTA "Let's Build"
- Hero: mono eyebrow `software studio · tetouan, morocco`, headline "Software studio in Tetouan." + sky-blue "Code that ages well.", subhead, dual CTAs ("Start a project →" / "See our work"), mono microcopy "30-min discovery call · we reply within 24h"
- Right-aside studio status panel (dark navy, mono): live online indicator, current sprint, next availability, team size, local time
- Services grid: "Four practices, one team." — 4 cards (01 software / 02 ecommerce / 03 training / 04 social) with project-count links per card
- Featured case study: RentCar, dark navy bg, 4 metric tiles (−60% admin time, 3→1 vendor systems, 14mo still maintaining, 99.9% uptime)
- Testimonial card: YB avatar, Friterie.ma quote, "read case study →" link
- "What happens next" 4-step strip with timing labels (~5 min / within 24h / 5 working days / within 2 weeks)
- Founder contact card: "Talk to Ahmed — founder." with "A" avatar, "Book 30 min →" CTA, WhatsApp + email fallback
- Footer with services list, company list, location block, copyright line

**Honor these from the Stitch render:**

1. Exact hero headline split, including "Code that ages well." as the sky-blue second line.
2. Mono eyebrow labels with `// section name` pattern throughout.
3. Studio status panel as the hero aside (replaces the originally-proposed specs.json card).
4. Card hover state shown on the E-commerce service card (sky-blue border + soft tech shadow per `DESIGN.md` §Elevation).
5. Two-tone tag system on case studies — sky-blue for tech stack, tertiary-red tint for industry.
6. "What happens next" timing labels are commitments, not aspirations. Match these in production.
7. Founder contact card as the final pre-footer section. Replaces the generic contact form.
8. Footer 4-column layout: brand+copyright / services / company / location.

**Reconcile these deltas from the Stitch render before implementation:**

1. **Footer services list is hallucinated.** Stitch shows "Web Development / Mobile Solutions / UI/UX Strategy / Cloud Systems" — these are NOT Bangicode's four practices. Production must use: **Custom Software / E-commerce / Technical Training / Social Presence** (matching the services grid above).
2. **Copyright year is wrong.** Stitch shows "© 2024 Bangicode" — should be **"© 2020–2026 Bangicode"** (or whichever range we lock in per §11 open question).
3. **Online indicator color drift.** Stitch rendered the studio-status `● online` dot in sky-blue. `DESIGN.md` reserves tertiary tech-red (#500000 / tertiary-fixed-dim #ffb4a9) for "record indicators" — Proposal A v3 used the tech-red shade as the single legitimate use of tertiary in the design. **Use the tech-red tint in production** to keep the tertiary palette earning its place.
4. **Missing stats strip.** Proposal A v3 had a 4-tile stats row directly under the hero with the thesis line "Senior engineers. Honest timelines. Code that lasts." Stitch dropped it. **Restore it in production** — it does above-the-fold trust work the rest of the page can't.
5. **Missing trusted-by row.** Proposal A v3 had a single-line client logo strip under the stats. Stitch dropped it. **Restore it** — even as text wordmarks, it signals real client breadth.
6. **Missing more-work peek.** Proposal A v3 had three mini case-study cards under RentCar (Coinluminaire / Classkom / Aqarchamal) with stack+industry tags. Stitch dropped them. **Restore them** — they prove "RentCar isn't the only one" without forcing a click.
7. **"Crafted with Moroccan precision" footer tagline (Stitch addition).** Nice line, optional to keep. Use only if it doesn't feel like overclaim.
8. **Typography in Stitch render.** Looks like Inter or a similar geometric sans, not Montserrat. Production must use Montserrat per `DESIGN.md` §Typography. Stitch is a font-substitution issue, not a design intent change.
9. **Top nav CTA naming.** Stitch renamed body CTA from "Start a project" → "Let's Build" in the nav, while keeping "Start a project →" in the hero. Pick one and use it consistently — recommend keeping "Start a project" everywhere (verb is more concrete, matches the form-first IA in "what happens next").
10. **Nav order.** Stitch dropped the "Industries" nav item I added in Proposal A v3. If we're building industry pages (per Sumatosoft inspiration), restore Industries between Portfolio and Process. If we're not, accept Stitch's tighter nav.

---

## 1B. Prototype implementation — `prototypes/v4-stitch.html`

A working HTML prototype of v4 was generated by Stitch + Claude Code and saved at `prototypes/v4-stitch.html`. It is a single-file Tailwind Play CDN build. **This is a reference artifact, not the production codebase.** The Next.js 16 + TS + shadcn project still needs to be scaffolded.

**What the prototype gets right (honor in production):**

- All v4 sections present and ordered correctly: hero with studio-status panel, thesis-line stats, trusted-by row, services grid (with hover state on each card), featured RentCar case with 4 metric tiles and stack+industry pills, more-work peek (Coinluminaire / Classkom / Aqarchamal) with pills, testimonial, 4-step "what happens next", founder contact card, 4-column footer, legal+social bottom row.
- Studio-status `● online` indicator uses `bg-tertiary-fixed-dim` (`#ffb4a8`) — DESIGN.md's tertiary palette, correctly applied as the single legitimate use of tech-red.
- Footer services list matches Bangicode's actual four practices (Custom software / E-commerce / Technical training / Social presence) — Stitch's earlier hallucination is fixed.
- Copyright reads `© 2020-2026 Bangicode. Crafted with Moroccan precision.` — correct year range, correct tagline.
- Industries item restored to nav.
- Mobile-first responsive scaffolding throughout (`md:` and `lg:` breakpoints, `flex-col md:flex-row` patterns, mobile hamburger button).
- All three fonts loaded: Montserrat, Hanken Grotesk, JetBrains Mono.
- Lowercase mono labels throughout — consistent voice.

**What must change before this is production code:**

| # | Issue | Severity | Action |
|---|---|---|---|
| 1 | **Tailwind Play CDN (`cdn.tailwindcss.com`)** | Blocker | Replace with proper Tailwind v4 install via npm in the Next.js project. Tailwind's docs are explicit: "Don't use this in production." Tokens move to a CSS `@theme` block, not a JS config object. |
| 2 | **Color drift from DESIGN.md** | High | Several tokens differ from `DESIGN.md` frontmatter. Reconcile before brand QA: `primary` is `#000c2c` (too dark) → should be `#002058`. `tertiary` is `#280000` → should be `#500000`. `secondary-container` is `#80c5fe` → should be `#5cb8fd`. `surface-container` is `#eceef4` → should be `#e3efff`. `surface-variant` is `#e0e2e8` → should be `#d1e4fb`. `tertiary-fixed-dim` is `#ffb4a8` → should be `#ffb4a9` (1 channel off, cosmetic). DESIGN.md is the source of truth. |
| 3 | **borderRadius scale wrong** | High | Prototype config: `DEFAULT: 0.125rem, lg: 0.25rem, xl: 0.5rem, full: 0.75rem`. DESIGN.md: `sm: 0.125rem, DEFAULT: 0.25rem, md: 0.375rem, lg: 0.5rem, xl: 0.75rem, full: 9999px`. The prototype's `full` is `0.75rem` instead of `9999px` — `rounded-full` will not produce pills. All cards built with this scale will need re-checking after the fix. |
| 4 | **Material Symbols Outlined icon font** | High | Stitch loaded Google's Material Symbols, which is ~700KB+ on first load and pulls icons by string name. Production should use **lucide-react** (already in the shadcn ecosystem, tree-shakeable per-icon, ~1KB per icon). Swap `arrow_forward`/`menu` for Lucide `ArrowRight`/`Menu` components. |
| 5 | **Tailwind v3 config syntax** | High | Prototype uses `tailwind.config = { theme: { extend: {...} } }` (v3 JS config). DESIGN.md decisions commit to Tailwind v4, where tokens live in a CSS `@theme` block. Translation is mechanical but must be done. |
| 6 | **No keyboard accessibility on interactive cards** | High | Service cards and "more work" cards use `<div class="cursor-pointer">` with no `tabindex`, no role, no keyboard handler. Production must use `<a>` elements (since they're navigable links) or add `role="button" tabindex="0"` with `onKeyDown`. WCAG 2.2 AA blocker. |
| 7 | **Focus rings missing** | High | DESIGN.md mandates a 2px sky-blue focus ring on all interactive elements. Prototype has `focus:ring-2 focus:ring-secondary` on footer links but nowhere else (CTAs, service cards, nav links, contact button all lack it). Add globally via a `focus-visible:` utility chain on shadcn `Button`. |
| 8 | **`bg-opacity-*` on custom tokens may not work** | Medium | Tailwind v3 `bg-on-primary-fixed-variant bg-opacity-50` requires color-with-alpha support. With custom color tokens, this can render as full opacity. Test on the case-study metric tiles. If broken, switch to `bg-on-primary-fixed-variant/50` arbitrary-opacity syntax (which works in v3.4+) or hardcoded `rgba()`. |
| 9 | **`fontFamily` and `fontSize` keys collision** | Low | Prototype uses the same names (`display-lg`, `headline-md`, etc.) for both `fontFamily` AND `fontSize`. Works in Tailwind v3 (separate namespaces) but is confusing. In Tailwind v4, normalize to: `fontFamily: { sans, mono, display }` + `fontSize: { display-lg, headline-md, ... }`. |
| 10 | **No i18n integration** | Expected | The `en · fr · ar` switcher is decorative text. Production needs `next-intl` with `[locale]` routes per the §3 IA, RTL for AR, and per-page locale negotiation. Already in the plan; not a prototype defect. |
| 11 | **No real form, no real booking flow** | Expected | All CTAs are `href="#"`. Production needs RHF + Zod + a server action for "Start a project," and a calendar booking integration (Cal.com / Calendly) for "Book 30 min." Already in the plan. |
| 12 | **Sticky header has a non-standard class** | Low | `<header class="docked full-width sticky">` — `docked` and `full-width` aren't Tailwind utilities. Either stub them or replace with `w-full top-0` (already present). Harmless but worth cleaning. |
| 13 | **`bg-on-primary-fixed-variant`** misuse | Low | Inside the RentCar dark navy section, metric-tile backgrounds use `bg-on-primary-fixed-variant` — that token name implies it's a *foreground* color (text on a `primary-fixed-variant` background). It still resolves to a hex value so it renders, but semantically wrong. Use `bg-primary-container` or a custom mid-navy tile token. |

**Recommendation:** when scaffolding the Next.js project, do the translation in this order: install Tailwind v4 cleanly → port tokens from `DESIGN.md` (NOT from this prototype's config) into `@theme` → swap Material Symbols for lucide-react → use this HTML as the structural / layout reference, not the style source.

---

## 2. What the current site actually is

A Create React App build (React 19) that renders eight sections on a single long page:

`Navigation → Hero → Services → Portfolio → Process → About → Contact → Footer`

`TestimonialsSection` and `CTASection` exist in source but are commented out in `App.js` — they don't render in production. The footer mentions Privacy / Terms / Cookie Policy but those routes don't exist.

**Heavy weight, low return:** roughly 2,500 LOC across `Hyperspeed.js` (1,125), `FloatingLines.js` (485), `LightRays.js` (399), and `SplitText.js` (194) — WebGL/Three.js/OGL effects that load on a marketing site. We drop these.

**Worth preserving (content):**
- 4 services: Custom Software, E-commerce, Technical Training, Social Media
- 12 portfolio projects: RentCar, Friterie.ma, Fujiwara, CafeImperial, Classkom, Coinluminaire, Aqarchamal, Nortecoffeeco, Ayaalmadina, Alaturco, Riha.ma, Cosas Buenas
- 4-step process: Discovery → Design/Dev → Testing → Deployment
- Stats: 20+ clients, 24+ projects, 5+ years, 24/7 support
- Contact: Av. Ali Yaeta, Centre Commercial Wilaya Center, Etage 6, N69, Tetouan · +212 6645 71370 · admin@bangicode.ma · M–F 9–6, Sat 10–2
- Founded 2020
- WhatsApp CTA (currently a floating button)
- i18n strings in EN / FR / AR (`src/locales/*.json`)

---

## 3. Information architecture (new)

Move from one-pager-with-anchors to a routed marketing site. Anchors stay supported for cross-linking but each section becomes a deep-linkable page.

```
/[locale]
├── /                          (Home — condensed hero + signal sections)
├── /services                  (Service overview)
│   ├── /software
│   ├── /ecommerce
│   ├── /training
│   └── /social
├── /work                      (Portfolio index, filterable)
│   └── /work/[slug]           (Case study — one per project, 12 total)
├── /about                     (Team, story, stats, values)
├── /process                   (4-step methodology, expanded)
├── /contact                   (Form + map + WhatsApp)
├── /careers                   (Footer already links here; build it)
├── /legal/privacy
├── /legal/terms
└── /legal/cookies
```

Locales: `/en`, `/fr`, `/ar` — AR auto-applies RTL via `dir="rtl"` on `<html>`. `next-intl` middleware handles locale negotiation; `hreflang` tags generated per page.

---

## 4. Design system wiring — Company brand registry (registry-driven, not local)

**This section was rewritten 2026-05-22.** The redesign now consumes the Bangicode design system as a private shadcn registry. Tokens and primitives are no longer authored in `next-app/`; they ship in from the library.

### Where the design system lives

- **Library repo:** https://github.com/bangicodefactory/bangicode-design-system (private)
- **Library docs site:** `design.bangicode.ma`
- **Registry namespace in consumer:** `@bangicode`
- **Registry URL:** `https://design.bangicode.ma/r/<name>.json`

### How `next-app/` consumes it

1. `components.json` declares two registries: `@shadcn` (public) and `@bangicode` (private).
2. Initial install pulls every component the redesign needs in one batch via `npx shadcn add @bangicode/...` (full list in IST-120).
3. Token CSS arrives THROUGH the installed components — there is no local `@theme` block to maintain.
4. `next-app/registry-version.json` pins the library's git SHA + `package.json` version. CI fails if it's stale > 14 days (IST-123 + IST-200).
5. When the library publishes a new version, refresh per-component: `npx shadcn add @bangicode/<name>` again, read the diff, commit. Verify against `/_smoke` (IST-129).

### What's in the registry (v0.1.0)

34 components across 6 categories — see the library's `CHANGELOG.md`. Notable ones the redesign relies on:

- **Forms:** `@bangicode/form` (RHF + Zod wrapper) plus all primitives — consumed by IST-126, IST-143, IST-156.
- **Marketing:** `@bangicode/hero` · `@bangicode/feature-grid` · `@bangicode/cta` · `@bangicode/testimonials` · `@bangicode/logo-cloud` · `@bangicode/faq` · `@bangicode/site-footer` — consumed by IST-132, IST-135, IST-136, IST-137-140, IST-141, IST-144.
- **Disclosure / containers:** `@bangicode/dialog` · `@bangicode/sheet` · `@bangicode/popover` · `@bangicode/card` · `@bangicode/badge` — consumed across the shell, work index, and cookie banner.

### What's NOT in the registry (build consumer-side)

Tracked in IST-127 (NavigationMenu) and IST-199 (bespoke sections — StudioStatusPanel, ThesisLineStats, TrustedByRow, RentCarFeaturedCase, PeekCards, WhatHappensNext, FounderCard). These use ONLY library token classes; no raw hex except the documented `tertiary-fixed-dim #ffb4a9` for the online dot.

### Rules

- **No local `@theme` block.** Token CSS comes from the library.
- **No patching installed component source.** Improvements go upstream as a library issue. Page-level wrappers are fine.
- **No local re-implementation of shadcn primitives.** If a primitive is missing from the library, propose it upstream; build a thin local version in the meantime only if blocking, and track the upstream issue in the consumer ticket.

### Why this changed

Originally (pre-2026-05-22), §4 documented a local `@theme` block and a shadcn variable bridge to be authored in `next-app/`. The Company brand library has since shipped v0.1.0 with 34 components plus the full DESIGN.md → Tailwind v4 token pipeline (per its own `CLAUDE.md` + `CHANGELOG.md`). Re-implementing that work in the consumer would duplicate it; consuming the registry keeps both projects in lockstep. IST-120 wires it; IST-200 documents the workflow; IST-198 (in the `bangicode component library` Linear project) tracks library-side version freshness.

### Type scale, baseline grid, elevation, shapes

All still per DESIGN.md — but they reach the consumer through the registry components, not through a local `@theme` block. The values below are kept here as a sanity reference (e.g., for the bespoke IST-199 sections that compose library tokens with custom layout):

- **8px baseline grid:** section vertical rhythm uses `py-16 md:py-24` (= 64/96px).
- **Type scale:** `display-lg` 48/56 (-0.02em) hero only · `headline-lg` 32/40 (24/32 mobile) · `headline-md` 24/32 cards · `body-lg` 18/28 marketing · `body-md` 16/24 UI · `label-mono` 14/20 (0.05em, JetBrains Mono) tech tags · `label-sm` 12/16 uppercase form labels.
- **Elevation:** flat-plus. 1px outline-variant border default; soft tech shadow on modals / dropdowns / card hover. 2px sky-blue focus ring on every interactive element.
- **Shapes:** 4px radius default; 8px on cards/containers; full pill on search/tags only.

---

## 5. Copy strategy (the "copyright" you mentioned)

Current copy is generic agency boilerplate. The rewrite has three goals:

1. **Position Bangicode as the Tetouan-based technical partner for Moroccan and EU-facing businesses** — lean into geography, not away from it.
2. **Replace vague benefits with concrete proof** — each service section names a portfolio project that demonstrates it (RentCar = software, CafeImperial = web dev, Coinluminaire = e-commerce, Riha.ma = social).
3. **Match DESIGN.md's "developer-centric, technical, reliable" voice** — short sentences, no marketing fluff, mono-font tech labels carrying weight.

**Languages:** All copy ships simultaneously in EN / FR / AR. AR copy is written natively, not translated word-for-word — RTL layout means line length and punctuation differ. French uses Moroccan-French conventions (formal `vous`, "société" not "compagnie").

**Legal pages (new):**
- **Privacy Policy** — GDPR + Moroccan Law 09-08 on personal data protection. Cookies, contact-form data, analytics.
- **Terms of Service** — service scope, IP ownership of deliverables, payment terms placeholder.
- **Cookie Policy** — what's set, opt-in banner.
- **Copyright footer** — `© 2020–2026 Bangicode SARL. All rights reserved.` with proper legal entity name (confirm SARL or other).

---

## 6. Motion language

Out: Hyperspeed tunnel, LightRays, FloatingLines particle fields.
In:
- 200ms ease-out fades on scroll-in (Framer Motion `whileInView`).
- 150ms hover transitions on cards (border color + tech shadow lift).
- 300ms accordion/dialog opens.
- Subtle marquee for client logos (CSS, no JS).
- Hero gets one quiet animated detail — a typed-text effect on the headline keyword, nothing more.

Respect `prefers-reduced-motion` everywhere.

---

## 7. Performance, a11y, SEO budgets

| Metric | Target |
|---|---|
| LCP (mobile, 4G) | < 2.0s |
| INP | < 200ms |
| CLS | < 0.05 |
| Total JS (initial) | < 150KB gzipped |
| Lighthouse Perf / A11y / SEO / Best | ≥ 95 each |
| WCAG | 2.2 AA |
| Hreflang | EN, FR, AR + x-default |

Why this is realistic: dropping ~2,500 LOC of WebGL frees ~600KB+ JS, RSC means most marketing pages ship near-zero client JS, `next/image` handles the portfolio screenshots, fonts self-hosted with `next/font`.

---

## 8. Rollout phases

**Phase 0 — Setup** (1–2 days)
Scaffold Next.js 16 + TS + Tailwind v4 + shadcn. Wire DESIGN.md tokens. Set up next-intl with EN/FR/AR + RTL middleware. Configure ESLint, Prettier, lint-staged, Playwright, Vitest.

**Phase 1 — Design system** (3–4 days)
Install shadcn primitives (Button, Card, Input, Textarea, Select, Dialog, Sheet, Tabs, Badge, Accordion, Tooltip, NavigationMenu). Build branded variants. Storybook or Ladle for component review.

**Phase 2 — Page shells + nav** (2 days)
Layout, Navigation (desktop + mobile sheet), Footer, locale switcher, theme tokens applied site-wide.

**Phase 3 — Marketing pages** (5–7 days)
Home, Services overview + 4 detail pages, Process, About, Contact (with RHF + Zod + server action), Careers.

**Phase 4 — Case studies** (4–5 days)
Portfolio index with filter (Software / E-commerce / Web / Social). 12 case-study pages from MDX with consistent template (problem → approach → stack → outcome → gallery).

**Phase 5 — Copy + i18n** (parallel with 3 & 4)
EN draft → FR adaptation → AR native rewrite. Translations stored as JSON / MDX with locale suffixes.

**Phase 6 — Legal + compliance** (1 day)
Privacy, Terms, Cookies. Cookie banner.

**Phase 7 — QA + launch** (2–3 days)
Lighthouse + axe + Playwright cross-browser, visual regression, RTL spot-check, real-device test on mid-range Android (Moroccan market reality), DNS cutover plan.

Total: ~3.5–4.5 weeks of focused work.

---

## 9. Agent roster — who does what

This is the centerpiece you asked for: which specialized agents are needed and how each plugs into the phases above. I've kept the two you named (**Impeccable** and **UI/UX Pro Max**) as their own personas and built the rest around them.

### Core build agents

**🎨 UI/UX Pro Max** — Design lead
- **Used in:** Phase 1, 2, 3, 4
- **Responsibilities:** Translates DESIGN.md into concrete component compositions; designs hero, service cards, case-study template, contact flow; produces Figma-quality mockups (or direct shadcn compositions) before code; reviews every page for hierarchy, spacing rhythm, and on-brand restraint; signs off on motion choices.
- **Inputs needed:** DESIGN.md, brand assets (logo SVG, the "S" tech-red icon), screenshots of competitor agency sites for tonal calibration.
- **Output:** Page-level design specs as MDX or component stories; sign-off comments on PRs.

**⚙️ Impeccable** — Code-quality / senior frontend engineer
- **Used in:** All phases
- **Responsibilities:** Owns code review on every PR. Enforces TS strictness, accessible JSX (semantic HTML, ARIA only when needed), no unnecessary client components, proper RSC boundaries, ESLint clean. Catches N+1 fetches, missing `key` props, hydration mismatches, unused dependencies. Refuses to merge anything below the perf/a11y budget.
- **Inputs needed:** PR diff, performance budget, this plan.
- **Output:** Review comments with concrete diffs; blocks merge until resolved.

**🧩 Component-library agent (shadcn specialist)**
- **Used in:** Phase 1, 2
- **Responsibilities:** Installs shadcn primitives, customizes variants to DESIGN.md, writes the `components.json` and CSS-variable bridge, maintains the Storybook/Ladle catalog, documents usage rules ("use `<Button variant=\"primary\">` for CTAs, `\"secondary\"` for navy outline, `\"ghost\"` for in-line text actions").
- **Output:** `/components/ui/*` directory + a `COMPONENTS.md` cheat-sheet.

**🌐 i18n + RTL agent**
- **Used in:** Phase 0, 5, 7
- **Responsibilities:** Configures next-intl, sets up `[locale]` routing, hreflang generation, middleware-based detection, RTL CSS audit (logical properties only — `ps-*`/`pe-*`, not `pl-*`/`pr-*`), Arabic typography (line-height adjustment for Arabic script), date/number localization. Catches places where the layout breaks in RTL.
- **Output:** Locale config, working RTL flip, side-by-side screenshots EN vs FR vs AR per page.

**✍️ Copywriter agent (trilingual)**
- **Used in:** Phase 3, 4, 5, 6
- **Responsibilities:** Writes EN master copy in Bangicode's voice (technical, confident, geography-aware). Adapts to French (Moroccan-French register). Writes Arabic natively — not machine-translated. Produces 12 case-study narratives following the problem/approach/stack/outcome template. Drafts legal pages.
- **Output:** Per-locale JSON for UI strings + MDX for long-form pages.

**📜 Legal/compliance agent**
- **Used in:** Phase 6
- **Responsibilities:** Drafts Privacy (GDPR + Moroccan Law 09-08), Terms, Cookie Policy. Identifies what data the contact form collects and how it's stored. Cookie banner consent model (opt-in for analytics, essential cookies pre-checked).
- **Output:** Three legal MDX pages + cookie banner copy + a `data-handling.md` internal note.

### Quality + verification agents

**♿ Accessibility auditor**
- **Used in:** Phase 7, and incrementally on every page
- **Responsibilities:** Runs axe-core on every page in CI; manual keyboard-nav walkthrough; checks focus rings (DESIGN.md mandates 2px sky-blue); verifies color contrast ≥ 4.5:1 for text, ≥ 3:1 for UI controls; tests with VoiceOver and NVDA; confirms `prefers-reduced-motion` works.
- **Output:** Per-page a11y report; blocks launch until WCAG 2.2 AA is clean.

**⚡ Performance agent**
- **Used in:** Phase 7, and per-PR for any page touching images/fonts/JS
- **Responsibilities:** Lighthouse + WebPageTest from a Casablanca/Madrid origin (closest to Moroccan users); enforces the budget table in §7; flags unnecessary client components; verifies font subsetting (Arabic needs separate subset); reviews bundle analyzer output.
- **Output:** Performance report per PR; bundle size budget in CI.

**🔍 SEO + structured-data agent**
- **Used in:** Phase 3, 4, 7
- **Responsibilities:** Per-page metadata (title, description, OG, Twitter), `hreflang`, canonical URLs, sitemap.xml, robots.txt, JSON-LD (`Organization`, `LocalBusiness` for the Tetouan office, `Service`, `BreadcrumbList`, `CreativeWork` for case studies). Indexability check against Search Console.
- **Output:** Sitemap, metadata helpers, structured-data utilities.

**🖼️ Visual QA / screenshot reviewer**
- **Used in:** Phase 7
- **Responsibilities:** Takes screenshots of every page at 3 breakpoints (375 / 768 / 1280) in all 3 locales = 9 shots per page. Diffs against the design specs from UI/UX Pro Max. Flags spacing, color, typography drift.
- **Output:** Visual regression baseline + PR comments on drift.

### Coordination + content agents

**📋 Linear/PM agent**
- **Used in:** Throughout
- **Responsibilities:** Maintains the ticket backlog in IST3, moves cards through states, links PRs to issues, posts a weekly status summary. Doesn't make scope calls — flags them to Ahmed.
- **Output:** Up-to-date Linear board; weekly digest in chat.

**📸 Asset/imagery agent**
- **Used in:** Phase 4
- **Responsibilities:** Sources or commissions case-study screenshots; optimizes for `next/image` (AVIF + WebP); ensures consistent aspect ratios per template; handles the team photo and office shots (the current `center1.jpeg`, `center2.jpeg`, `Team.PNG`, `logo_imperial.png` need replacement or upgrade).
- **Output:** `/public/case-studies/*` and `/public/team/*` with manifest.

### Optional but high-value

**🛡️ Security review agent** — runs once before launch. Checks form input sanitization, server-action CSRF protections, dependency CVEs, `Content-Security-Policy` headers, no secrets in env files committed.

**📊 Analytics agent** — Plausible or Umami (cookieless, GDPR-friendly) instead of GA4. Defines event taxonomy: `cta_click`, `case_study_view`, `contact_submit`, `whatsapp_click`, `locale_switch`.

**🎯 Conversion-rate agent** — A/B tests hero copy and CTA wording post-launch. Lightweight, only meaningful once there's organic traffic.

---

## 10. Linear backlog — LIVE in `ista3` project

**Status:** Pushed 2026-05-20. 8 milestones (E1–E8) + 45 issues (IST-119 → IST-163) + 6 new project-specific labels.

**Live board:** [bangicode.ma redesign in Linear](https://linear.app/ista3/project/bangicodema-redesign-9a74ccf5c4b9/overview)

**Ticket map (epic → IST range):**
- E1 Foundation: IST-119 → IST-123 (5 tickets) · target 2026-05-22
- E2 Design system: IST-124 → IST-129 (6 tickets) · target 2026-05-27
- E3 Site shell: IST-130 → IST-134 (5 tickets) · target 2026-05-29
- E4 Marketing pages: IST-135 → IST-144 (10 tickets) · target 2026-06-05
- E5 Portfolio + case studies: IST-145 → IST-150 (6 tickets) · target 2026-06-08
- E6 Copy (EN/FR/AR): IST-151 → IST-153 (3 tickets) · target 2026-06-05
- E7 Legal + compliance: IST-154 → IST-156 (3 tickets) · target 2026-06-09
- E8 Quality + launch: IST-157 → IST-163 (7 tickets) · target 2026-06-12

**Labels created for the project:** `i18n` · `copy` · `legal` · `a11y` · `design` · `seo` (added to the existing workspace labels: `shadcn-ui`, `migration`, `perf`, `docs`, `Feature`, `Improvement`, `Bug`).

The detailed ticket breakdown below is preserved as a reference / future-proofing if Linear ever needs to be re-seeded. Live state lives in Linear.

---

### Original proposed structure (archived)

Tickets grouped by epic. Each story includes acceptance criteria.

### Epic E1 — Foundation
- **E1-1** Scaffold Next.js 16 + TS + Tailwind v4 + ESLint/Prettier · AC: app boots on `/en`, `/fr`, `/ar`; lint passes
- **E1-2** Install + configure shadcn/ui with DESIGN.md tokens · AC: Button/Card/Input render with brand colors; CSS variables match DESIGN.md frontmatter
- **E1-3** Configure next-intl with locale routing + RTL middleware · AC: locale switcher works; AR sets `dir="rtl"`; hreflang tags emitted
- **E1-4** Wire fonts (Montserrat, Hanken Grotesk, JetBrains Mono) via `next/font` with Arabic subset · AC: all three families render; CLS < 0.05; Arabic glyphs correct
- **E1-5** CI: typecheck, lint, build, Playwright smoke, Lighthouse budget · AC: PRs blocked on regression

### Epic E2 — Design system
- **E2-1** Branded Button variants (primary / secondary / ghost) · AC: matches DESIGN.md §Components
- **E2-2** Card variants with hover state (1px outline → sky-blue + tech shadow) · AC: hover transition 150ms
- **E2-3** Form primitives (Input, Textarea, Select, Label) with focus ring · AC: 2px sky-blue ring; uppercase label-sm
- **E2-4** Navigation primitives (desktop NavigationMenu + mobile Sheet)
- **E2-5** Badge + Chip with `label-mono` for tech tags
- **E2-6** Storybook/Ladle catalog · AC: every component documented

### Epic E3 — Site shell
- **E3-1** Root layout: html `lang`/`dir`, font setup, theme · AC: all locales SSR-correct
- **E3-2** Navigation bar (desktop + mobile + locale switcher) · AC: keyboard nav clean; sticky behavior; logo + 5 nav items + CTA
- **E3-3** Footer (4 columns: brand, services, company, contact) · AC: legal links route correctly
- **E3-4** WhatsApp floating CTA (preserve current behavior, restyled) · AC: opens wa.me with prefilled message; respects locale

### Epic E4 — Marketing pages
- **E4-1** Home page (condensed hero + 4-service teaser + featured work + process + stats + CTA)
- **E4-2** `/services` overview
- **E4-3** `/services/software` deep dive
- **E4-4** `/services/ecommerce` deep dive
- **E4-5** `/services/training` deep dive
- **E4-6** `/services/social` deep dive
- **E4-7** `/about` (story, team, stats, values)
- **E4-8** `/process` (expanded 4-step methodology with examples)
- **E4-9** `/contact` (form + RHF/Zod + server action + map + WhatsApp + hours) · AC: spam protection, success state, email delivery
- **E4-10** `/careers` (real page, not placeholder)

### Epic E5 — Portfolio + case studies
- **E5-1** `/work` index with filter (All / Software / E-commerce / Web / Social)
- **E5-2** Case-study template (problem · approach · stack · outcome · gallery)
- **E5-3 – E5-14** 12 case studies (one ticket each): RentCar, Friterie.ma, Fujiwara, CafeImperial, Classkom, Coinluminaire, Aqarchamal, Nortecoffeeco, Ayaalmadina, Alaturco, Riha.ma, Cosas Buenas

### Epic E6 — Copy
- **E6-1** EN master copy: nav, home, services overview, about, process, contact, careers
- **E6-2** EN copy: 4 service detail pages
- **E6-3** EN copy: 12 case studies
- **E6-4** FR adaptation of all of the above
- **E6-5** AR native rewrite of all of the above

### Epic E7 — Legal + compliance
- **E7-1** `/legal/privacy` (GDPR + Moroccan Law 09-08)
- **E7-2** `/legal/terms`
- **E7-3** `/legal/cookies` + cookie banner
- **E7-4** Confirm legal entity name + copyright footer

### Epic E8 — Quality + launch
- **E8-1** Accessibility audit (WCAG 2.2 AA) per page
- **E8-2** Performance pass (LCP < 2.0s mobile, JS < 150KB)
- **E8-3** SEO: sitemap, robots, JSON-LD, OG images per page
- **E8-4** Visual QA at 3 breakpoints × 3 locales
- **E8-5** Analytics (Plausible) + event taxonomy
- **E8-6** DNS cutover plan + rollback runbook

---

## 11. Open questions — resolved 2026-05-20 except where noted

1. ~~Legal entity name~~ → **RESOLVED**: Bangicode SARL.
2. ~~Founding year for copyright~~ → **RESOLVED**: © 2020–2026.
3. ~~Testimonials~~ → **RESOLVED**: keep Youssef B. / Friterie.ma placeholder until Ahmed replaces manually.
4. ~~Case-study depth~~ → **RESOLVED**: short 1-screen summaries + "available on request" CTA. Major scope reduction (saves ~5–7 days).
5. ~~Analytics~~ → **RESOLVED**: Google Analytics 4. Cookie banner must use opt-in consent flow for GDPR.
6. ~~Hosting~~ → **RESOLVED**: **Vercel** (Hobby → Pro when traffic warrants). Rationale: native Next.js support, auto-preview deployments per PR, edge CDN with MENA PoP, TLS auto-renewing, 0-config ISR/SSR. Full cutover plan in `docs/cutover-runbook.md`.
7. ~~Existing Linear conventions~~ → **RESOLVED via API**: team `ISTA3` (key `IST`), workspace labels reusable: `shadcn-ui`, `migration`, `perf`, `docs`, `Feature`, `Improvement`, `Bug`. Project-specific labels to create: `i18n`, `copy`, `legal`, `a11y`, `design`, `seo`.

### Still parked

- **"Late July 2026" studio status availability** — placeholder in the design. Replace with real next opening, or strip the field.
- **Founder is "Ahmed"** in the contact card — confirmed implicitly by user keeping it in v3/v4 with no pushback. Use Ahmed Chioua's real name in production.
- **Cal.com event URL** — once Ahmed creates a Cal.com booking event for "30-min discovery call," the URL gets wired into the "Book 30 min →" CTA. Until then, link to a placeholder `/book` route.
- ~~Hosting decision~~ — resolved, see item 6 above.

---

## 12. What I'll do once you greenlight

In order:
1. Answer the open questions in §11.
2. Push the Linear backlog into IST3 (if approved).
3. Scaffold the Next.js project alongside the existing `bangicode-website/` folder so the old site stays running until cutover.
4. Start Phase 0 → 1 (foundation + design system) — these unblock everything.
