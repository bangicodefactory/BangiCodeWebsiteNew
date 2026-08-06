// Root not-found for routes outside [locale] (e.g., /smoke/nonexistent).
// next-intl requires this file when the root layout returns children without html/body.
import { BRAND } from "@/lib/brand-colors";

export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <main
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "monospace",
            fontSize: "0.875rem",
            color: BRAND.ink600,
          }}
        >
          404 — Page not found
        </main>
      </body>
    </html>
  );
}
