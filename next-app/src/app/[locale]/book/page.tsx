import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { CalInline } from "@/components/CalEmbed";

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
  return { title: t("pageTitle") };
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Cal.com may require an absolute URL for redirectUrl depending on its hosting mode.
  // SITE_URL is set by CI/production; falls back to the live domain.
  const siteUrl = process.env.SITE_URL ?? "https://bangicode.ma";
  const redirectUrl = `${siteUrl}/${locale}?booked=true`;

  return (
    <>
      {/* Warm up the Cal.com connection before the embed JS runs */}
      <link rel="preconnect" href="https://cal.com" crossOrigin="anonymous" />
      <link
        rel="preconnect"
        href="https://app.cal.com"
        crossOrigin="anonymous"
      />
      <main
        id="main-content"
        className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6"
      >
        <div className="h-[calc(100vh-8rem)] min-h-96">
          <CalInline locale={locale as Locale} redirectUrl={redirectUrl} />
        </div>
      </main>
    </>
  );
}
