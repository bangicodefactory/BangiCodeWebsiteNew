import { getTranslations } from "next-intl/server";

export async function ThesisLineStats() {
  const t = await getTranslations("Home.thesis");

  const stats = [
    { value: t("projectsValue"), label: t("projectsLabel") },
    { value: t("clientsValue"), label: t("clientsLabel") },
    { value: t("yearsValue"), label: t("yearsLabel") },
    { value: t("supportValue"), label: t("supportLabel") },
  ];

  return (
    <section
      id="thesis"
      className="border-border bg-background border-y py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p
          dir="ltr"
          className="text-muted-foreground mb-6 font-mono text-xs tracking-widest uppercase"
        >
          {t("eyebrow")}
        </p>

        <h2 className="font-display text-foreground mb-12 max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
          {t("headline")}
        </h2>

        <dl className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <dt className="font-display text-primary text-4xl font-bold tracking-tight sm:text-5xl">
                {stat.value}
              </dt>
              <dd className="text-muted-foreground font-mono text-xs">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
