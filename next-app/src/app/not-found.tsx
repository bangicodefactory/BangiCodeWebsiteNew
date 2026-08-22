import Image from "next/image";
import Link from "next/link";
import { Chakra_Petch, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/*
 * 404 for everything OUTSIDE the [locale] tree.
 *
 * Two kinds of request land here, and both matter:
 *
 *  - Paths the i18n middleware skips. Its matcher excludes anything containing
 *    a dot, so /old-page.html, /nope.txt and every bot probe for
 *    /wp-login.php reach [locale] with a filename as the locale. The layout
 *    rejects it and throws — and because the LAYOUT is what threw, the
 *    boundary that catches is this one, not [locale]/not-found.tsx.
 *  - Anything else outside a locale, e.g. /smoke/nonexistent.
 *
 * This file used to render a bare monospace line with inline styles — the exact
 * page [locale]/not-found.tsx was written to stop the site serving. Fixing the
 * 500 those dotted paths returned made this the visible answer for every stale
 * inbound link, including the twelve legacy /work/<slug> case-study URLs, so it
 * had to stop being a placeholder.
 *
 * It is a SEPARATE ROOT LAYOUT boundary: the root layout returns children with
 * no <html>, so this file owns the document and must import globals.css and
 * instantiate its own fonts (same trap as /smoke and /admin — ADR 0001, bug 5).
 * next/font deduplicates the downloads, so the repetition is free.
 *
 * No next-intl anywhere. A request that got here has no established locale by
 * definition; asking for one is what made these paths 500. The copy is English
 * and the links are unprefixed, so the middleware sends them to the right
 * locale on the way through.
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

export default function NotFound() {
  return (
    <html
      lang="en"
      className={`${chakraPetch.variable} ${manrope.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="bg-background text-foreground h-full antialiased">
        <main
          id="main-content"
          className="max-w-content mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-24 text-center sm:px-6"
        >
          <div className="mb-10 rounded-sm bg-white px-3 py-2">
            <Image
              src="/brand/logo.svg"
              alt="Bangicode"
              width={160}
              height={25}
              priority
              className="h-[25px] w-auto"
            />
          </div>

          <p
            dir="ltr"
            className="text-muted-foreground font-mono text-xs tracking-widest uppercase"
          >
            {"// 404"}
          </p>
          <h1 className="font-display text-foreground mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            This page doesn&apos;t exist.
          </h1>
          <p className="font-body text-muted-foreground mt-4 max-w-md text-base leading-relaxed">
            The link may be out of date, or the page may have moved.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {/*
             * next/link, deliberately NOT next-intl's: this boundary has no
             * established locale, and asking for one is what made these paths
             * 500 in the first place. Unprefixed targets are correct — the
             * middleware routes them to the visitor's locale.
             *
             * Styled with the same tokens as the Button primitive rather than
             * composing it, so the last page a lost visitor sees carries no
             * dependency beyond the stylesheet.
             */}
            <Link
              href="/"
              className="bg-spark text-primary-foreground focus-visible:ring-ring inline-flex h-11 items-center justify-center rounded-sm px-6 text-sm font-medium transition-[opacity,scale] duration-200 ease-out hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none active:scale-[0.96]"
            >
              Back to the homepage
            </Link>
            <Link
              href="/portfolio"
              className="border-secondary text-foreground focus-visible:ring-ring inline-flex h-11 items-center justify-center rounded-sm border px-6 text-sm font-medium transition-[opacity,scale] duration-200 ease-out hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none active:scale-[0.96]"
            >
              See our work
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
