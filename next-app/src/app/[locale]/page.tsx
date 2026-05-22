import type { Locale } from "./layout";
import { locales } from "./layout";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const labels: Record<Locale, { heading: string; sub: string }> = {
  en: {
    heading: "Software studio in Tetouan.",
    sub: "Custom software · E-commerce · Technical training · Social presence",
  },
  fr: {
    heading: "Studio logiciel à Tétouan.",
    sub: "Logiciels sur mesure · E-commerce · Formation technique · Présence sociale",
  },
  ar: {
    heading: "استوديو برمجيات في تطوان.",
    sub: "برمجيات مخصصة · تجارة إلكترونية · تدريب تقني · حضور رقمي",
  },
};

export default async function LocalePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const copy = labels[locale as Locale] ?? labels.en;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-gray-900">
      <p className="font-mono text-sm tracking-widest text-blue-600">
        bangicode.ma — scaffold
      </p>
      <h1 className="font-display text-4xl font-bold tracking-tight">
        {copy.heading}
      </h1>
      <p className="font-body text-lg text-gray-600">{copy.sub}</p>
      <p className="mt-8 font-mono text-xs text-gray-400">
        IST-119 · Next.js 16 + TypeScript + Tailwind v4
      </p>
    </main>
  );
}
