import type { ReactNode } from "react";
import "./globals.css";

// Root layout is intentionally minimal: html/body/fonts live in [locale]/layout.tsx
// so each locale route controls lang= and dir= on <html>.
// This file is still required by Next.js for the root not-found.tsx edge.
//
// globals.css is imported HERE as well as in each root-level layout, because the
// stylesheet is emitted per segment and the root not-found has no segment of its
// own. When [locale]/layout.tsx throws notFound() for a junk locale — which is
// every path the i18n middleware skips, i.e. anything with a dot in it — that
// layout never contributes its CSS, and the 404 rendered without a single style
// rule. Importing at the root gives that boundary a stylesheet to inherit.
// Next deduplicates the import, so the locale/admin/smoke layouts keep theirs.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
