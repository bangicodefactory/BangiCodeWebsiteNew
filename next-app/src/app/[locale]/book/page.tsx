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
  // Redirect back to the home page after booking so BookedToast can fire.
  const redirectUrl = `/${locale}?booked=true`;

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6"
    >
      <div className="h-[calc(100vh-8rem)] min-h-96">
        <CalInline locale={locale as Locale} redirectUrl={redirectUrl} />
      </div>
    </main>
  );
}
