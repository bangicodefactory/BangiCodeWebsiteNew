import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { ServiceDetailPage } from "@/components/sections/ServiceDetailPage";
import { serviceSchema, BASE_URL } from "@/lib/json-ld";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Services.software" });
  return { title: t("h1"), description: t("subhead") };
}

const STACK = ["Laravel", "Next.js", "Inertia", "Postgres", "Redis"] as const;

export default async function SoftwarePage() {
  const t = await getTranslations("Services.software");
  const ld = serviceSchema({
    name: t("h1"),
    description: t("subhead"),
    url: `${BASE_URL}/en/services/software`,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <ServiceDetailPage
        eyebrow={t("eyebrow")}
        h1={t("h1")}
        subhead={t("subhead")}
        capEyebrow={t("capEyebrow")}
        capabilities={[
          { title: t("cap01Title"), body: t("cap01Body") },
          { title: t("cap02Title"), body: t("cap02Body") },
          { title: t("cap03Title"), body: t("cap03Body") },
        ]}
        stackEyebrow={t("stackEyebrow")}
        stackTags={STACK}
        processEyebrow={t("processEyebrow")}
        steps={[t("step01"), t("step02"), t("step03"), t("step04")]}
        caseEyebrow={t("caseEyebrow")}
        caseClient={t("caseClient")}
        caseDesc={t("caseDesc")}
        caseCtaLabel={t("caseCtaLabel")}
        ctaHeadline={t("ctaHeadline")}
        ctaButton={t("ctaButton")}
      />
    </>
  );
}
