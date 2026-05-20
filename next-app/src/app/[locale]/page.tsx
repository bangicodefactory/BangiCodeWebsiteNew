import type { Locale } from "./layout";

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
  const isRTL = locale === "ar";

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      className="bg-surface text-on-surface flex min-h-screen flex-col items-center justify-center gap-4 px-6"
    >
      <p className="text-secondary font-mono text-sm tracking-widest">
        bangicode.ma — scaffold
      </p>
      <h1 className="font-display text-4xl font-bold tracking-tight">
        {copy.heading}
      </h1>
      <p className="font-body text-on-surface-variant text-lg">{copy.sub}</p>
      <p className="text-outline mt-8 font-mono text-xs">
        IST-119 · Next.js 16 + TypeScript + Tailwind v4
      </p>
    </main>
  );
}
