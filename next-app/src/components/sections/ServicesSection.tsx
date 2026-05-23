import { getTranslations } from "next-intl/server";

export async function ServicesSection() {
  const t = await getTranslations("Home.services");

  const services = [
    {
      number: t("s01Number"),
      title: t("s01Title"),
      body: t("s01Body"),
    },
    {
      number: t("s02Number"),
      title: t("s02Title"),
      body: t("s02Body"),
    },
    {
      number: t("s03Number"),
      title: t("s03Title"),
      body: t("s03Body"),
    },
    {
      number: t("s04Number"),
      title: t("s04Title"),
      body: t("s04Body"),
    },
  ];

  return (
    <section id="services" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p
          dir="ltr"
          className="text-muted-foreground mb-4 font-mono text-xs tracking-widest uppercase"
        >
          {t("eyebrow")}
        </p>
        <h2 className="font-display text-foreground mb-12 text-3xl font-bold tracking-tight sm:text-4xl">
          {t("headline")}
        </h2>

        <div className="bg-border grid grid-cols-1 gap-px sm:grid-cols-2">
          {services.map((svc) => (
            <article
              key={svc.number}
              className="bg-background flex flex-col gap-4 p-8"
            >
              <span
                dir="ltr"
                className="text-secondary-container font-mono text-xs"
              >
                {svc.number}
              </span>
              <h3 className="font-display text-foreground text-xl font-bold">
                {svc.title}
              </h3>
              <p className="font-body text-muted-foreground text-sm leading-relaxed">
                {svc.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
