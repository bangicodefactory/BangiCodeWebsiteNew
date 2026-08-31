# ADR 0001 — Adopt the Claude Design System token set, authored locally

- **Status:** Accepted · one decision reversed — see the `StudioStatusPanel` note below (2026-08-14)
- **Date:** 2026-08-05
- **Supersedes:** `DESIGN.md` (colour values), `REDESIGN_PLAN.md` §1 (Styling / Visual reference), §1A, §1B, §4; `CLAUDE.md` "Token source of truth" and "Component library" rule 1.

---

## Context

Three facts forced this decision.

**1. The site has no colour system at runtime.**

`bangicodecurrent/src/app/globals.css` contains a deliberately empty `@theme {}` block:

```css
/*
 * Token CSS arrives through the Company brand registry components (IST-120).
 * Do NOT author DESIGN.md tokens here — consume via `npx shadcn add @bangicode/<name>`.
 * The @theme block below is intentionally empty until IST-120 wires the registry.
 */
@theme {
  /* populated by @bangicode/* registry components — see IST-120 */
}
```

Every brand class used across the codebase — `bg-primary`, `text-foreground`, `text-muted-foreground`, `text-secondary-container`, `bg-surface-container`, `border-border`, `ring-ring`, `bg-card`, `text-accent`, `bg-destructive`, `text-on-error-container` — therefore compiles to **nothing**. Verified against the compiled stylesheet: `grep -c "bg-primary"` returns `0`. The live site renders in Tailwind defaults, black text on white. Every visual decision recorded in `DESIGN.md` is currently inert.

**2. The registry that was supposed to supply those tokens does not exist.**

- `components.json` points `@bangicode` at `https://design.bangicode.ma/r/{name}.json`.
- That endpoint 404s. `bangicodecurrent/registry-version.json` records it: `"status": "pending"`, `"reason": "Registry endpoint … returns 404 — design.bangicode.ma not yet deployed."`, `libraryVersion: null`, `installedAt: null`.
- No `@bangicode` package is installed in `node_modules`.

The rule "do not author tokens locally, they ship in from the registry" has been blocking all styling work for as long as the registry has been undeployed, with no delivery date.

**3. An approved design now exists, and its palette is the logo's palette.**

"D · Full brief (trilingual)" in the _bangicode Design System_ Claude Design project
(`https://claude.ai/design/p/db111a28-9a25-463e-a215-4677395eb0bd`) was approved as the
visual direction. Its three brand anchors are:

| Token        | Hex       |
| ------------ | --------- |
| `--navy-700` | `#114483` |
| `--sky-500`  | `#2E91CE` |
| `--red-500`  | `#D30F33` |

These are **exactly the fills inside `brand/logo.svg`**, as documented in CLAUDE.md's
"Brand assets" section. That section also states the logo's colours deliberately differ
from the `DESIGN.md` tokens, and instructs: _"If a design asks for the logo to 'match the
theme,' resist. The drift is by design."_

That instruction protected the logo from being repainted to match the UI. It does not
argue against moving the UI to match the logo — which is what adopting this token set
does, and which removes the drift entirely rather than preserving it.

---

## Decision

1. **Author `@theme` locally**, in a new `bangicodecurrent/src/styles/tokens.css` imported by
   `globals.css`. Drop the "never author tokens locally" rule.
2. **Adopt the Claude Design System palette** (navy / sky / red / ink ramps) as the token
   source of truth, replacing the `DESIGN.md` colour values (`#002058` primary,
   `#5cb8fd` secondary-container, `#500000` tertiary, and the Material-3 surface set).
3. **Adopt its typography**: Chakra Petch (display), Manrope (body), JetBrains Mono
   (unchanged — eyebrows, labels, metadata). For `ar`, **IBM Plex Sans Arabic**
   replaces both display and body: neither Latin face has Arabic coverage, Plex
   has a real weight range where Noto Sans Arabic reads as a system default, and
   one family for both roles keeps `/ar` to a single extra download.

   Implementation note: font stacks are indirected through
   `--font-display-stack` / `--font-body-stack` / `--font-mono-stack`, exactly
   as the colours are. Pointing a utility straight at a `next/font` variable via
   `@theme inline` bakes the value into the utility, so `[lang="ar"]` overrides
   never reach it and Tailwind drops the rule entirely. That is precisely why
   the pre-existing Arabic font swap was dead — see "Two bugs found on the way".

4. **Adopt its shape, depth and motion scales**: radii 10/14/20–28px + pill; navy-tinted
   shadows; `--ease-out` / `--ease-spring` at 120/200/360ms; 1320px content width.
5. **Keep both semantic vocabularies alive.** Live components mix shadcn names
   (`foreground`, `muted-foreground`, `card`, `ring`, `accent`, `destructive`) with
   Material-3 names (`on-surface`, `outline`, `surface-container`, `primary-container`,
   `on-error-container`). Both are mapped onto the new ramps so no existing component
   silently renders unstyled. Converging on one vocabulary is deliberately out of scope.

### Consequences accepted

- `DESIGN.md` is superseded for colour. It stays in the repo for history, marked at the top.
- The Stitch prototype (`prototypes/v4-stitch.html`) is no longer the visual reference.
- If `design.bangicode.ma` ever ships, `tokens.css` is the single seam to remove. Keeping
  tokens in their own file rather than inline in `globals.css` exists for exactly that reason.
- CI's `check:registry-pin` (fails when the pin is stale > 14 days) now guards a registry
  we do not consume. It should be disabled or repointed — tracked separately, not in this ADR.
- The focus ring moves from 2px to 3px (the design system's `--ring-focus`). CLAUDE.md's
  a11y budget said 2px; 3px is strictly more visible, so this is not a WCAG regression.

---

## Deliberate departures from Design D

Recorded here so they are not later mistaken for implementation drift.

**Copy voice.** Design D is written as a "digital solutions agency" ("Transforming ideas
into powerful digital solutions", eyebrow "DIGITAL SOLUTIONS AGENCY"). This contradicts the
established studio voice ("Software studio in Tetouan." / "Code that ages well.", lowercase
brand name, verb-first CTAs) and CLAUDE.md's software-company-not-marketing positioning.
**We take D's layout, structure, section order and visual language; we keep the existing
voice and the existing 92-string `Home` catalog.** The design project's own author flagged
this contradiction and asked which positioning was final — this ADR is the answer.

> **⚠ Reversed on 2026-08-14 — the panel was removed.** Everything below about
> `StudioStatusPanel` describes a component that no longer exists. Kept as the record of
> what was decided, not as a description of the code.
>
> The argument below rests on the panel being *live* — current sprint, next availability,
> local time. Nothing kept those fields current, so in practice it advertised a sprint on
> "Friterie.ma iOS" and availability in "late july 2026". A staleness-prone differentiator
> is a liability rather than a differentiator, and the honest fix was to drop it rather
> than to promise upkeep nobody had signed up for. `LocalClock` went with it, having had no
> other consumer. See the "Consumer-specific sections" note in CLAUDE.md.
>
> Design D's assignment of spark-red to "the active dot" still stands as a token decision;
> it simply no longer has a consumer.

**`StudioStatusPanel` is kept.** Design D has no slot for it. It stays anyway: live local
time, current sprint and next availability are a genuine differentiator, it is called out
as a bespoke section in CLAUDE.md / IST-199, and it fits D's stated "thin technical
texture, mono metadata" language better than anything D actually shows. It renders as a
compact mono strip inside the dark hero.

Its online dot currently uses an inline `#ffb4a9`, justified in CLAUDE.md as "the single
legitimate use of tech-red". Design D's system independently assigns spark-red to "the
active dot", so the inline hex is replaced by a `spark` token — same intent, no raw hex,
and now matching the logo.

**The homepage contact band carries no form.** D closes on a dark band containing a full
contact form. `/contact` already owns that form and its server action. Duplicating it would
mount a second form island on the LCP page and give two pages competing copies of the same
intake, with the duplicate-content signal that implies. The band carries the ask — founder,
headline, spark CTA — and hands off to `/contact`.

**Testimonials stay a single card.** D lays out three quotes. We have one real quote and
CLAUDE.md locks it. Filling D's grid would mean fabricating client testimony, so it renders
as one centred card and keeps `data-placeholder="true"`.

**The portfolio is one dark band, not three equal cards.** D shows three equal project
cards. That would discard RentCar.ma's four hard metrics (-60% / 3→1 / 14mo / 99.9%), which
are the strongest proof on the page. `FeaturedCase` leads the band and `PeekCards` continues
it below on the same dark surface, joined by a hairline — one band, two densities.

**The FAQ uses native `<details>`/`<summary>`, not an Accordion primitive.** The browser
supplies the disclosure semantics, keyboard handling and focus behaviour, it works before
hydration, and it keeps the section off the client bundle — which matters because it sits
below the fold on the LCP page. CLAUDE.md's "still to build: Accordion" line is retired.

---

## Six bugs found on the way

All four were pre-existing. The first two share a failure mode: a Tailwind
colour/font token that resolves to nothing produces no error, no warning, and no
build failure — the element simply renders unstyled.

**1. No colour system at all.** Described above. Every brand class in the
codebase compiled to nothing.

**2. The Arabic font swap never worked.** `globals.css` had
`[lang="ar"] { --font-display: var(--font-noto-arabic) }`. But the bridge used
`@theme inline`, which compiles `.font-display` to
`font-family: var(--font-montserrat)` — the value is baked in, so reassigning
`--font-display` cannot reach it. Tailwind then dropped the `[lang="ar"]` rule
from the output entirely (verified: it is absent from the compiled CSS).
Arabic pages rendered headings in a Latin face with system fallback for Arabic
glyphs. Arabic _body_ copy was worse still — only display was ever swapped, so
body text had no Arabic face at all.

Both are now guarded by `e2e/tokens.spec.ts` and `scripts/check-tokens.mjs`.
Both guards were self-tested against the broken state rather than trusted
because they went green.

**3. Every case-study page returned 500 in production.** Found while renaming
`/work` → `/portfolio`. `[locale]/layout.tsx` called `getMessages()` with no
locale argument, so next-intl resolved the locale from request headers. That
makes the render dynamic — but `[slug]/page.tsx` declared
`generateStaticParams`, so Next tried to prerender those paths and threw
`DYNAMIC_SERVER_USAGE`. All twelve case studies 500'd. Build output had been
marking the route `●` (SSG) the whole time, and no test had ever loaded a
`/work/<slug>` URL, so nothing surfaced it.

Fixed with `setRequestLocale(locale)` in the layout and in each `[slug]` page,
plus adding `locale` to the `[slug]` routes' `generateStaticParams` (they varied
only by slug, leaving the locale segment with nothing to prerender against).
Side effect: the homepage, book, legal and blog routes now prerender too — 105
static pages where there were none. `e2e/routes.spec.ts` now loads a case study
in all three locales so this cannot return quietly.

**4. The case-study CTA overflowed the viewport on mobile.** Masked by bug 3 —
the page never rendered, so nobody saw it. `Button`'s base carries
`whitespace-nowrap`, which suits the two-word labels used everywhere else, but
this label is a locked full sentence ("Full case study available on request —
contact us"). At 390px it measured 412px wide in EN and 540px in FR, putting the
whole page into horizontal scroll. Fixed at the call site
(`whitespace-normal h-auto`) rather than by removing `whitespace-nowrap` from
the primitive.

**5. The smoke gallery never loaded a stylesheet.** `/smoke` is a separate root
layout — a sibling of `[locale]`, not a child — and `src/app/smoke/layout.tsx`
imported no CSS and set no font variables. So the surface built to verify that
components render correctly had itself been rendering as unstyled HTML since it
was created. `/smoke/button` exists to prove the button variants work and could
not have displayed one of them. Fixed by importing `globals.css` and applying
the three Latin font variables in that layout.

This one is worth dwelling on: the gallery would have shown the _original_
token bug (bug 1) immediately, and could not, because it was broken in a way
that looked the same as what it was meant to detect.

**6. The homepage had no `main` landmark, and inner pages had two
`id="main-content"`.** `[locale]/layout.tsx` wrapped children in a `<div
id="main-content">` while fourteen inner pages each declared their own `<main
id="main-content">`. On those pages the id appeared twice (invalid HTML, and an
ambiguous skip-link target); on the homepage, whose `page.tsx` returns a bare
fragment of sections, there was no `main` landmark at all. Lighthouse's
`landmark-one-main` failed. The layout now owns the single `<main>` and inner
pages render plain `<div>`s.

Two smaller fixes came out of the same audit: the trust-strip client names used
`text-foreground/55`, which lands at 3.7:1 over that band's `ink-100` and fails
AA (now `text-muted-foreground`, 6.4:1); and the footer's phone/email/WhatsApp
links were 16px-tall targets against WCAG 2.2's 24×24 minimum (2.5.8).

`src/lib/alternates.ts` also hardcoded `https://bangicode.ma` while
`layout.tsx` and `robots.ts` honoured `SITE_URL`. The homepage passed
Lighthouse's `canonical` audit only because its canonical comes from the layout;
`/solutions`, `/blog` and the case studies would all have emitted a cross-origin
canonical the moment they were added to `.lighthouserc.json`. Now consistent.

After these, Lighthouse on `/en`, `/ar` and `/en/solutions` scores **100
accessibility, 100 best-practices, 100 SEO**, with **CLS 0.00**.

---

## Known approximation — intermediate ramp stops

Only three ramp stops are known by hex (the three above, corroborated by `brand/logo.svg`).
The design system displays `--ink-50…950`, `--navy-50…950`, `--sky-*` and `--red-*` as
swatch ramps, but renders them in cross-origin iframes on `claudeusercontent.com`, so their
computed values could not be read programmatically, and the swatches are not hex-labelled.

**The intermediate stops in `tokens.css` are therefore generated** — a perceptually even
OKLCH ramp anchored on the three known hexes, with the ink ramp carrying the faint blue
tint the design system specifies for its neutrals. Known-exact values used as-is:

| Role     | Hex       | Source               |
| -------- | --------- | -------------------- |
| navy-700 | `#114483` | design system + logo |
| sky-500  | `#2E91CE` | design system + logo |
| red-500  | `#D30F33` | design system + logo |
| success  | `#1f9d6b` | design system readme |
| warning  | `#e0922f` | design system readme |

If exact ramp values are later obtained from the design project, replace the generated
stops in `tokens.css`; nothing else needs to change, because every semantic token is
defined by reference to a ramp stop rather than by literal hex.

---

## Alternatives rejected

**Wait for the registry.** No delivery date, and it has already blocked all styling work.

**Keep the `DESIGN.md` palette, take only D's layout.** Considered and explicitly rejected:
it would preserve the logo/UI colour drift and produce a site visually unlike the design
that was approved.

**Converge the two semantic vocabularies now.** Would touch every section component in the
same change as the token swap, making a failure impossible to bisect. Deferred.
