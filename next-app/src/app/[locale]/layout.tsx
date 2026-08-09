import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import {
  Chakra_Petch,
  Manrope,
  JetBrains_Mono,
  IBM_Plex_Sans_Arabic,
} from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { routing, type Locale } from "@/i18n/routing";
import { SiteNav } from "@/components/sections/site-nav";
import { SiteFooter } from "@/components/sections/site-footer";
import { BookedToast } from "@/components/BookedToast";
import { DeferredClientUI } from "@/components/DeferredClientUI";
import "../globals.css";

// Display — techno, cut-corner geometric. Echoes the logo's beveled lettering.
// See docs/adr/0001-adopt-claude-design-system-tokens.md
const chakraPetch = Chakra_Petch({
  variable: "--font-chakra-petch",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

// Body — friendly modern grotesque, very legible at small sizes.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Mono — eyebrows, labels, metadata, code. Unchanged.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

/*
 * Arabic — ONE family covering both display and body.
 *
 * Neither Chakra Petch nor Manrope has Arabic coverage. Previously only the
 * DISPLAY font was swapped for /ar, which meant Arabic *body* copy silently
 * fell through to a system font — a pre-existing bug, not a new one. Both
 * --font-display and --font-body are now redirected in tokens.css.
 *
 * IBM Plex Sans Arabic over Noto Sans Arabic: it has a real weight range and
 * reads as a designed choice next to JetBrains Mono (both Plex-adjacent),
 * whereas Noto Sans Arabic reads as a system default. Using one family for
 * both roles also keeps /ar to a single extra download, which matters against
 * the LCP < 2.0s budget.
 *
 * preload: false — never downloaded on en/fr routes.
 */
const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

// SITE_URL lets CI override the origin so the canonical matches the test server.
// In production this env var is unset and falls back to the live domain.
const BASE_URL = process.env.SITE_URL ?? "https://bangicode.ma";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  /*
   * `[locale]` matches any single segment, so a junk value reaches here on
   * every path the i18n middleware skips. Emitting the normal metadata for one
   * produced `<link rel="canonical" href="…/nope.txt">` on a 404 — self-
   * canonicalising a page that does not exist, alongside hreflang alternates
   * for it. Next marks not-found responses noindex so nothing was indexed, but
   * a 404 has no business claiming a canonical URL.
   */
  if (!(routing.locales as readonly string[]).includes(locale)) {
    return { metadataBase: new URL(BASE_URL) };
  }

  const t = await getTranslations({ locale, namespace: "Meta" });

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: t("defaultTitle"),
      template: "%s | Bangicode",
    },
    description: t("description"),
    alternates: {
      // Per-page overrides should specify the full path; this layout-level
      // entry covers every page that doesn't set its own alternates.
      languages: {
        en: `${BASE_URL}/en`,
        fr: `${BASE_URL}/fr`,
        ar: `${BASE_URL}/ar`,
        "x-default": `${BASE_URL}/en`,
      },
      canonical: `${BASE_URL}/${locale}`,
    },
  };
}

const SKIP_LABEL: Record<Locale, string> = {
  ar: "الانتقال إلى المحتوى",
  fr: "Aller au contenu",
  en: "Skip to content",
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!(routing.locales as readonly string[]).includes(locale)) {
    /*
     * Establish a request locale BEFORE throwing. `[locale]` matches any single
     * segment, so every path the i18n middleware skips — its matcher excludes
     * anything containing a dot — lands here with a filename as the locale:
     * /nope.txt, /old-page.html, every bot probing /wp-login.php. Rendering the
     * 404 from that state made next-intl resolve the locale the only way left
     * to it, by reading request headers, which turns a static render dynamic
     * and answers 500 instead of 404.
     *
     * The value is a formality — nothing localized survives the notFound()
     * below — but it has to be present before anything downstream asks.
     */
    setRequestLocale(routing.defaultLocale);
    notFound();
  }

  /*
   * Without this, getMessages()/getTranslations() resolve the locale by reading
   * request headers, which makes every render dynamic. Routes that declare
   * generateStaticParams are then asked to prerender while touching a dynamic
   * API, and Next throws DYNAMIC_SERVER_USAGE — a 500, not a warning.
   *
   * That was live: all twelve case studies under /work/<slug> returned 500 in a
   * production build. The route was marked ● (SSG) in build output the whole
   * time and no test covered a case-study URL, so nothing caught it.
   *
   * setRequestLocale puts the locale in the request store instead, so the
   * static paths render without headers.
   */
  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  /*
   * For AR, emit the Plex Arabic variable instead of the Latin display face;
   * tokens.css [lang="ar"] then redirects BOTH --font-display and --font-body
   * to it. Manrope still ships on /ar because Latin runs (brand names, tech
   * chips, "RentCar.ma") appear inside Arabic pages.
   */
  const localeFontClass =
    locale === "ar" ? plexArabic.variable : chakraPetch.variable;

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`${localeFontClass} ${manrope.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <a
              href="#main-content"
              className="focus:bg-primary focus:text-primary-foreground sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:h-auto focus:w-auto focus:overflow-visible focus:rounded-sm focus:px-4 focus:py-2 focus:outline-none"
            >
              {SKIP_LABEL[locale as Locale]}
            </a>
            <SiteNav locale={locale as Locale} />
            {/*
             * <main>, not <div>. Two pre-existing problems met here:
             *
             *  - The homepage had NO main landmark at all. page.tsx returns a
             *    fragment of sections, and this wrapper was a plain div, so
             *    Lighthouse's landmark-one-main failed and screen-reader users
             *    had no "skip to main" destination that announced as main.
             *  - Every inner page declared its own <main id="main-content">
             *    inside this div, so those pages shipped the id twice — invalid
             *    HTML, and the skip link's target was ambiguous.
             *
             * One <main> lives here now; inner pages render plain <div>s.
             */}
            <main id="main-content" tabIndex={-1} className="outline-none">
              {children}
            </main>
            <SiteFooter />
            <DeferredClientUI />
            <Suspense>
              <BookedToast />
            </Suspense>
            <Toaster position="bottom-center" richColors />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
