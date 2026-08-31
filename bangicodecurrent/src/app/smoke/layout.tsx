import type { ReactNode } from "react";
import { Chakra_Petch, Manrope, JetBrains_Mono } from "next/font/google";
import "../globals.css";

// force-dynamic: smoke pages are gated by middleware; SSG would fail outside [locale] routing context.
export const dynamic = "force-dynamic";

/*
 * /smoke is a SEPARATE ROOT LAYOUT — a sibling of [locale], not a child — so it
 * inherits nothing from [locale]/layout.tsx: no globals.css, no font variables,
 * no token layer.
 *
 * That was the bug. This file imported no stylesheet at all, which meant the
 * gallery built to verify that components render correctly was itself rendering
 * as unstyled HTML. /smoke/button exists to prove the button variants work and
 * could not have shown a single one of them.
 *
 * The three Latin faces are re-instantiated here rather than imported from the
 * locale layout because next/font must be called at module scope in the file
 * that uses it. The downloads are deduplicated, so this costs nothing. Arabic is
 * deliberately absent — the gallery is an internal, English-only surface.
 */
const chakraPetch = Chakra_Petch({
  variable: "--font-chakra-petch",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export default function SmokeLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${chakraPetch.variable} ${manrope.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
