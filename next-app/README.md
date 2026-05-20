# Bangicode — next-app

Next.js 16 (App Router) · TypeScript strict · Tailwind v4 · shadcn/ui

IST-119: scaffold. Design tokens sourced from `../DESIGN.md`.

## Getting started

```bash
pnpm dev          # start dev server at http://localhost:3000 (redirects to /en)
pnpm build        # production build
pnpm start        # serve production build
```

## Quality checks

```bash
pnpm lint         # ESLint (eslint-config-next + typescript)
pnpm format:check # Prettier dry-run
pnpm format       # Prettier auto-fix
pnpm typecheck    # tsc --noEmit
```

## Locale routes

The app serves three locales:

| Path  | Language                                                     |
| ----- | ------------------------------------------------------------ |
| `/en` | English                                                      |
| `/fr` | French                                                       |
| `/ar` | Arabic (RTL — full `dir="rtl"` wired in IST-3 via next-intl) |

Root `/` redirects to `/en`.

## Stack

| Layer      | Choice                                                       |
| ---------- | ------------------------------------------------------------ |
| Framework  | Next.js 16.2.6 (App Router, RSC)                             |
| Language   | TypeScript 5 strict                                          |
| Styling    | Tailwind CSS 4 (`@theme` CSS-first)                          |
| Fonts      | Montserrat / Hanken Grotesk / JetBrains Mono via `next/font` |
| Linting    | ESLint 9 + eslint-config-next                                |
| Formatting | Prettier 3 + prettier-plugin-tailwindcss                     |

## Design tokens

All brand tokens (`--color-*`, `--radius-*`, `--font-*`, `--shadow-*`) live in  
`src/app/globals.css` under the `@theme` block. The authoritative source is  
`../DESIGN.md` — do not port values from `../prototypes/v4-stitch.html`,  
which has drifted from the brand spec.
