import { getTranslations } from "next-intl/server";

/*
 * The stats strip that closes Design D's dark hero band. It is a separate
 * component (and a separate <section>) only because it was already one — it is
 * meant to read as the bottom of the hero, so it carries the same
 * data-surface="dark" and the same background, joined by a hairline.
 *
 * Order is D's: clients, projects, years, support.
 */
export async function ThesisLineStats() {
  const t = await getTranslations("Home.thesis");

  const stats = [
    { value: t("clientsValue"), label: t("clientsLabel") },
    { value: t("projectsValue"), label: t("projectsLabel") },
    { value: t("yearsValue"), label: t("yearsLabel") },
    { value: t("supportValue"), label: t("supportLabel") },
  ];

  return (
    <section
      id="thesis"
      data-surface="dark"
      className="border-border bg-background border-t"
    >
      <div className="max-w-content mx-auto px-4 py-14 text-center sm:px-6 sm:py-16">
        <p
          dir="ltr"
          className="text-muted-foreground font-mono text-xs tracking-widest uppercase"
        >
          {t("eyebrow")}
        </p>

        <h2 className="font-display text-foreground mx-auto mt-4 max-w-2xl text-xl font-bold tracking-tight text-balance sm:text-2xl">
          {t("headline")}
        </h2>

        <dl className="border-border mt-12 grid grid-cols-2 gap-y-10 border-t pt-12 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse gap-2">
              <dt className="text-muted-foreground font-mono text-xs tracking-wider">
                {stat.label}
              </dt>
              <dd className="font-display text-secondary-container text-4xl font-bold tracking-tight sm:text-5xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
