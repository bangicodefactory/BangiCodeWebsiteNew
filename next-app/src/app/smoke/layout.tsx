import type { ReactNode } from "react";

// Smoke pages are gated by middleware (SMOKE_GALLERY=1) and are never served
// in production. Disable static generation so prerender doesn't run hooks that
// require routing context (e.g. next-intl usePathname) outside [locale] routes.
export const dynamic = "force-dynamic";

export default function SmokeLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
