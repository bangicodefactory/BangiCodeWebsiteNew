import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Montserrat, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import "../globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

const BASE_URL = "https://bangicode.ma";

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

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${montserrat.variable} ${hankenGrotesk.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
