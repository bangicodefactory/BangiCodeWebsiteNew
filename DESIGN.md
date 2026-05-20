---
# Brand tokens — source of truth for @theme wiring
# All values here override the prototype (prototypes/v4-stitch.html) which has drifted

colors:
  # Surface scale
  surface: "#f7f9ff"
  surface-bright: "#f7f9ff"
  surface-dim: "#d8dae0"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f1f3f9"
  surface-container: "#e3efff"          # prototype had #eceef4 — use this
  surface-container-high: "#e6e8ee"
  surface-container-highest: "#e0e2e8"
  surface-variant: "#d1e4fb"            # prototype had #e0e2e8 — use this
  on-surface: "#091d2e"                 # prototype had #181c20 — use this
  on-surface-variant: "#444650"
  inverse-surface: "#2d3135"
  inverse-on-surface: "#eff1f7"

  # Primary (deep navy)
  primary: "#002058"                    # prototype had #000c2c — use this
  on-primary: "#ffffff"
  primary-container: "#1a3673"          # prototype had #002058 (swapped) — use this
  on-primary-container: "#7389c7"
  primary-fixed: "#dae2ff"
  primary-fixed-dim: "#b2c5ff"
  on-primary-fixed: "#001847"
  on-primary-fixed-variant: "#2d457d"
  inverse-primary: "#b2c5ff"
  surface-tint: "#465d96"

  # Secondary (sky blue — interactive / links)
  secondary: "#006397"
  on-secondary: "#ffffff"
  secondary-container: "#5cb8fd"        # prototype had #80c5fe — use this
  on-secondary-container: "#00517d"
  secondary-fixed: "#cce5ff"
  secondary-fixed-dim: "#93ccff"
  on-secondary-fixed: "#001d31"
  on-secondary-fixed-variant: "#004b73"

  # Tertiary (tech red — accent only; studio online indicator)
  tertiary: "#500000"                   # prototype had #280000 — use this
  on-tertiary: "#ffffff"
  tertiary-container: "#510000"
  on-tertiary-container: "#dc6857"
  tertiary-fixed: "#ffdad4"
  tertiary-fixed-dim: "#ffb4a9"         # prototype had #ffb4a8 (1 channel off)
  on-tertiary-fixed: "#410000"
  on-tertiary-fixed-variant: "#83251b"

  # Error
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"

  # Outline
  outline: "#757781"
  outline-variant: "#c4c6d1"

  # Background (alias for surface)
  background: "#f7f9ff"
  on-background: "#181c20"

typography:
  families:
    display: Montserrat          # headlines, hero
    body: Hanken Grotesk         # body text, UI
    mono: JetBrains Mono         # labels, tags, code
  scale:
    display-lg:  { size: 48px, lineHeight: 56px, tracking: -0.02em, weight: 700 }
    headline-lg: { size: 32px, lineHeight: 40px, weight: 700 }   # mobile: 24/32
    headline-md: { size: 24px, lineHeight: 32px, weight: 600 }
    body-lg:     { size: 18px, lineHeight: 28px, weight: 400 }
    body-md:     { size: 16px, lineHeight: 24px, weight: 400 }
    label-mono:  { size: 14px, lineHeight: 20px, tracking: 0.05em, family: mono }
    label-sm:    { size: 12px, lineHeight: 16px, transform: uppercase }

radius:
  sm:   "0.125rem"
  DEFAULT: "0.25rem"
  md:   "0.375rem"
  lg:   "0.5rem"
  xl:   "0.75rem"
  full: "9999px"              # pills — prototype had 0.75rem (wrong)

spacing:
  base: 8px                   # 8px baseline grid
  xs:   4px
  sm:   8px
  md:   16px
  lg:   24px
  xl:   32px
  2xl:  48px
  3xl:  64px
  gutter: 24px
  container-max: 1280px

elevation:
  tech-shadow: "0 4px 12px rgba(26, 54, 115, 0.08)"
  focus-ring: "2px solid #5cb8fd"   # sky-blue, 2px, all interactive elements

section-rhythm:
  py-mobile: 64px    # py-16
  py-desktop: 96px   # py-24
---

# Bangicode DESIGN.md

Brand source of truth for the redesign. All `@theme` values in `next-app/src/app/globals.css` must be ported from the YAML frontmatter above, not from `prototypes/v4-stitch.html`.

## Key rules

- `primary` (#002058) is deep navy — the brand foundation, not `#000c2c`.
- `tertiary-fixed-dim` (#ffb4a9) is the **only** legitimate use of tech-red. Studio status `● online` indicator uses this color.
- `borderRadius.full` is `9999px` for pills — not `0.75rem` as the prototype has.
- `secondary` (#006397) is sky-blue — used for all interactive elements (links, CTAs, focus rings).
- The focus ring is always 2px solid `secondary-container` (#5cb8fd).

## Legal

- Entity: **Bangicode SARL**
- Copyright: `© 2020–2026 Bangicode SARL. Crafted with Moroccan precision.`
