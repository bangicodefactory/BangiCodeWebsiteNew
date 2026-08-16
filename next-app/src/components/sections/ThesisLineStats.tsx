import { getTranslations } from "next-intl/server";

/*
 * The stats strip that closes Design D's dark hero band. It is a separate
 * component (and a separate <section>) only because it was already one — it is
 * meant to read as the bottom of the hero, so it carries the same
 * data-surface="dark" and the same background, joined by a hairline.
 *
 * Order is D's: clients, projects, years. D had a fourth, "24/7 client support",
 * dropped on 2026-08-16 — a studio of this size cannot staff a round-the-clock
 * desk, and a promise the business cannot keep is worse than no promise.
 */
export async function ThesisLineStats() {
  const t = await getTranslations("Home.thesis");

  const stats = [
    { value: t("clientsValue"), label: t("clientsLabel") },
    { value: t("projectsValue"), label: t("projectsLabel") },
    { value: t("yearsValue"), label: t("yearsLabel") },
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

        {/*
          Three across at every width. It was `grid-cols-2 sm:grid-cols-4`,
          which balanced with four stats — 2×2 on mobile, one row on desktop.
          With three, that leaves an orphan on the second mobile row and an
          empty fourth column pulling the row off-centre on desktop.
        */}
        <dl className="border-border mt-12 grid grid-cols-3 gap-y-10 border-t pt-12">
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
