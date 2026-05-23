import type { ReactNode } from "react";

// force-dynamic: smoke pages are gated by middleware; SSG would fail outside [locale] routing context.
export const dynamic = "force-dynamic";

export default function SmokeLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
