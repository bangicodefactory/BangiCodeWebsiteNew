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
import { ServicesSection } from "@/components/sections/ServicesSection";
import { FeaturedCase } from "@/components/sections/FeaturedCase";
import { PeekCards } from "@/components/sections/PeekCards";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { WhatHappensNext } from "@/components/sections/WhatHappensNext";
import { FounderCard } from "@/components/sections/FounderCard";

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
  return {
    title: "Bangicode — Software Studio in Tetouan",
    description: t("body"),
  };
}

export default async function LocalePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            organizationSchema(),
            websiteSchema(),
            localBusinessSchema(),
          ]),
        }}
      />
      <LegacyHashRedirect />
      <HeroSection />
      <ThesisLineStats />
      <TrustedByRow />
      <ServicesSection />
      <FeaturedCase />
      <PeekCards />
      <TestimonialsSection />
      <WhatHappensNext />
      <FounderCard />
    </>
  );
}
