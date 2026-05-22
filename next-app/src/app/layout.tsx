import type { ReactNode } from "react";

// Root layout is intentionally minimal: html/body/fonts live in [locale]/layout.tsx
// so each locale route controls lang= and dir= on <html>.
// This file is still required by Next.js for the root not-found.tsx edge.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
