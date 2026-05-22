# Bangicode — next-app

Next.js 16 (App Router) · TypeScript strict · Tailwind v4 · Company brand registry

IST-119: scaffold. This app consumes the Company brand registry — see
[IST-120](https://linear.app/ista3/issue/IST-120) for registry wiring and
[IST-231](https://linear.app/ista3/issue/IST-231) for the pin/refresh workflow.

## Getting started

```bash
pnpm dev          # start dev server at http://localhost:3000 (redirects to /en)
pnpm build        # production build
pnpm start        # serve production build
```

## Quality checks

```bash
pnpm lint         # ESLint (eslint-config-next + jsx-a11y)
pnpm format:check # Prettier dry-run
pnpm format       # Prettier auto-fix
pnpm typecheck    # tsc --noEmit
```

## Locale routes

The app serves three locales:

| Path  | Language                                                       |
| ----- | -------------------------------------------------------------- |
| `/en` | English                                                        |
| `/fr` | French                                                         |
| `/ar` | Arabic (RTL — full `dir="rtl"` wired in IST-151 via next-intl) |

Root `/` redirects to `/en`.

## Stack

| Layer      | Choice                                                                 |
| ---------- | ---------------------------------------------------------------------- |
| Framework  | Next.js 16.2.6 (App Router, RSC)                                       |
| Language   | TypeScript 5 strict (`noUncheckedIndexedAccess`)                       |
| Styling    | Tailwind CSS 4 — token CSS via Company brand registry (IST-120)        |
| Fonts      | Montserrat / Hanken Grotesk / JetBrains Mono via `next/font` (IST-152) |
| Linting    | ESLint 9 + eslint-config-next + eslint-plugin-jsx-a11y                 |
| Formatting | Prettier 3 + prettier-plugin-tailwindcss (root `.prettierrc`)          |

## Design system

Brand tokens (`--color-*`, `--radius-*`, `--font-*`, `--shadow-*`) are **not** authored
locally. They arrive through installed `@bangicode/*` registry components. Do not port
values from `../prototypes/v4-stitch.html` or author a local `@theme` block — the registry
is the bridge from `DESIGN.md` to Tailwind v4.

See the [Company brand library](https://github.com/bangicodefactory/bangicode-design-system)
and `CLAUDE.md §Component library` for the consumption workflow.
