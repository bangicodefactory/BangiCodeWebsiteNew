import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const RENTCAR_STACK = ["React", "Laravel", "MySQL", "AWS"] as const;

export async function FeaturedCase() {
  const t = await getTranslations("Home.featuredCase");

  const metrics = [
    { value: t("adminTimeValue"), label: t("adminTimeLabel") },
    { value: t("vendorsValue"), label: t("vendorsLabel") },
    { value: t("maintainedValue"), label: t("maintainedLabel") },
    { value: t("uptimeValue"), label: t("uptimeLabel") },
  ];

  return (
    <section id="work" className="bg-primary py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p
          dir="ltr"
          className="text-primary-foreground/60 mb-4 font-mono text-xs tracking-widest uppercase"
        >
          {t("eyebrow")}
        </p>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — client info */}
          <div className="flex flex-col gap-6">
            <h2 className="font-display text-primary-foreground text-3xl font-bold tracking-tight sm:text-4xl">
              <span className="text-secondary-container">{t("client")}</span>
              <br />
              {t("headline")}
            </h2>

            <div className="flex flex-wrap gap-2">
              {RENTCAR_STACK.map((tech) => (
                <span
                  key={tech}
                  className="text-primary-foreground/70 bg-primary-container rounded-sm px-2 py-0.5 font-mono text-xs"
                >
                  {tech}
                </span>
              ))}
              <span className="text-primary-foreground/70 bg-primary-container rounded-sm px-2 py-0.5 font-mono text-xs">
                {t("industry")}
              </span>
            </div>

            <Link
              href="/contact"
              className="text-secondary-container focus-visible:ring-ring w-fit rounded-sm font-mono text-sm underline underline-offset-4 hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
            >
              {t("cta")}
            </Link>
          </div>

          {/* Right — metrics grid */}
          <dl className="bg-primary-container/30 grid grid-cols-2 gap-px">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="bg-primary flex flex-col-reverse items-start gap-1 p-6"
              >
                <dt className="text-primary-foreground/60 font-mono text-xs">
                  {m.label}
                </dt>
                <dd className="font-display text-secondary-container text-4xl font-bold tracking-tight">
                  {m.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
