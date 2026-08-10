import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { CalendlyInline } from "@/components/CalendlyEmbed";
import { buildAlternates } from "@/lib/alternates";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Booking" });
  return {
    title: t("pageTitle"),
    alternates: buildAlternates("/book", locale),
  };
}

export default async function BookPage() {
  return (
    <>
      {/*
       * Warm up Calendly before the embed JS runs. Two hosts: the script comes
       * from assets.calendly.com and the booking iframe from calendly.com, so
       * preconnecting only one still leaves a cold handshake on the slower half.
       */}
      <link
        rel="preconnect"
        href="https://assets.calendly.com"
        crossOrigin="anonymous"
      />
      <link
        rel="preconnect"
        href="https://calendly.com"
        crossOrigin="anonymous"
      />
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <div className="h-[calc(100vh-8rem)] min-h-96">
          {/*
           * The post-booking path is relative, and next-intl's router adds the
           * locale prefix — so a French visitor lands on /fr?booked=true and
           * sees the toast in their own language.
           */}
          <CalendlyInline bookedPath="/?booked=true" />
        </div>
      </div>
    </>
  );
}
