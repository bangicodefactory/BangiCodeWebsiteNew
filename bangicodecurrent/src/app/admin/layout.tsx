import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Chakra_Petch, Manrope, JetBrains_Mono } from "next/font/google";
import "../globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bangicode CMS",
  // Belt and braces alongside robots.txt — /admin should never be indexed.
  robots: { index: false, follow: false },
};

/*
 * /admin is a SEPARATE ROOT LAYOUT — a sibling of [locale], not a child. It
 * therefore inherits nothing: no globals.css, no font variables, no token layer.
 *
 * That is exactly how the smoke gallery shipped broken for months (ADR 0001,
 * bug 5): a sibling root that imported no stylesheet, so the surface built to
 * verify styling had none. Importing globals.css and declaring the three Latin
 * faces here is not boilerplate — it is the fix for a bug this codebase has
 * already made once.
 *
 * English-only and LTR by design. The CMS edits trilingual content but is
 * itself an internal tool; localising it would triple the surface for no user.
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

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${chakraPetch.variable} ${manrope.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="bg-background text-foreground min-h-full antialiased">
        {children}
      </body>
    </html>
  );
}
