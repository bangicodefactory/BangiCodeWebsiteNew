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

## Company brand registry

Components come from the private `@bangicode` shadcn registry, not from local authoring.
Brand tokens flow in through the installed components — there is no local `@theme` block.

### Install a component

```bash
# Install one component
npx shadcn add @bangicode/button

# Install all initial components (run once when registry is live)
npx shadcn add @bangicode/button @bangicode/card @bangicode/input \
  @bangicode/label @bangicode/textarea @bangicode/select @bangicode/form \
  @bangicode/badge @bangicode/sheet @bangicode/dialog @bangicode/dropdown-menu \
  @bangicode/separator @bangicode/avatar @bangicode/site-footer @bangicode/hero \
  @bangicode/feature-grid @bangicode/cta @bangicode/testimonials \
  @bangicode/logo-cloud @bangicode/faq
```

Components land in `src/components/ui/<name>.tsx`. After installing or refreshing,
update `../registry-version.json` with the library's git SHA, version, and timestamp.

### What `@bangicode/<name>` means

`@bangicode` is the registry namespace configured in `components.json`. The shadcn CLI
resolves it to `https://design.bangicode.ma/r/<name>.json`. Components are identical
to shadcn/ui primitives but pre-wired to the Bangicode DESIGN.md token pipeline.

### Updating a component

```bash
npx shadcn add @bangicode/<name>   # re-runs the install, overwriting the local file
```

Review the diff before committing — the library may have changed the component's API
or styling. Update `../registry-version.json` after any refresh.

### Docs

Library source: [github.com/bangicodefactory/bangicode-design-system](https://github.com/bangicodefactory/bangicode-design-system)
Registry docs: `design.bangicode.ma`

### Smoke test

Visit `/smoke` after installing components to verify the token pipeline is working
(navy primary, sky-blue secondary-container, JetBrains Mono on badge text).
