import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import {
  organizationSchema,
  websiteSchema,
  localBusinessSchema,
} from "@/lib/json-ld";
import { LegacyHashRedirect } from "@/components/LegacyHashRedirect";
import { HeroSection } from "@/components/sections/HeroSection";
import { ThesisLineStats } from "@/components/sections/ThesisLineStats";
import { TrustedByRow } from "@/components/sections/TrustedByRow";
import { WhyBangicode } from "@/components/sections/WhyBangicode";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { SolutionsSection } from "@/components/sections/SolutionsSection";
import { FeaturedCase } from "@/components/sections/FeaturedCase";
import { PeekCards } from "@/components/sections/PeekCards";
import { WhatHappensNext } from "@/components/sections/WhatHappensNext";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { FounderCard } from "@/components/sections/FounderCard";
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
  const t = await getTranslations({ locale, namespace: "Home.hero" });
  const meta = await getTranslations({ locale, namespace: "Meta" });
  return {
    // `absolute` opts out of the layout's "%s | Bangicode" template — the
    // localized home title already carries the brand.
    title: { absolute: meta("homeTitle") },
    description: t("body"),
    alternates: buildAlternates("/", locale),
  };
}

export default async function LocalePage() {
  const meta = await getTranslations("Meta");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            organizationSchema(meta("description")),
            websiteSchema(),
            localBusinessSchema(meta("description")),
          ]),
        }}
      />
      <LegacyHashRedirect />
      {/*
       * Design D's section order. Three dark navy bands carry the page:
       * hero + stats, the portfolio (featured case + more work), and the
       * closing contact band. Everything between them is light.
       */}
      <HeroSection />
      <ThesisLineStats />
      <TrustedByRow />
      <WhyBangicode />
      <ServicesSection />
      <SolutionsSection />
      <FeaturedCase />
      <PeekCards />
      <WhatHappensNext />
      <TestimonialsSection />
      <FaqSection />
      <FounderCard />
    </>
  );
}
