import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Montserrat,
  Hanken_Grotesk,
  JetBrains_Mono,
  Noto_Sans_Arabic,
} from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { routing, type Locale } from "@/i18n/routing";
import { SiteNav } from "@/components/sections/site-nav";
import { SiteFooter } from "@/components/sections/site-footer";
import { BookedToast } from "@/components/BookedToast";
import "../globals.css";

// Deferred — all three start hidden/invisible so deferring avoids blocking the
// initial JS bundle with scroll-tracking, consent logic, and analytics loading.
const GaLoader = dynamic(
  () => import("@/components/GaLoader").then((m) => ({ default: m.GaLoader })),
  { ssr: false },
);

const CookieBanner = dynamic(
  () =>
    import("@/components/sections/CookieBanner").then((m) => ({
      default: m.CookieBanner,
    })),
  { ssr: false },
);

const WhatsAppCta = dynamic(
  () =>
    import("@/components/WhatsAppCta").then((m) => ({
      default: m.WhatsAppCta,
    })),
  { ssr: false },
);

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

// Loaded only for the /ar locale — preload: false avoids downloading it on en/fr routes.
// Sets --font-noto-arabic; globals.css [lang="ar"] rule maps it to --font-display.
const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
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
  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: "Bangicode — Software Studio in Tetouan",
      template: "%s | Bangicode",
    },
    description:
      "Custom software, e-commerce, technical training, and social presence — built in Tetouan, Morocco.",
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
    notFound();
  }

  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  // For AR: swap the display font class to Noto Sans Arabic.
  // globals.css [lang="ar"] then redirects --font-display → var(--font-noto-arabic).
  const displayFontClass =
    locale === "ar" ? notoSansArabic.variable : montserrat.variable;

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`${displayFontClass} ${hankenGrotesk.variable} ${jetbrainsMono.variable} h-full`}
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
            <div id="main-content" tabIndex={-1} className="outline-none">
              {children}
            </div>
            <SiteFooter />
            <GaLoader />
            <CookieBanner />
            <WhatsAppCta />
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
