import { getTranslations } from "next-intl/server";

/*
 * Four numbered process steps. Design D sets these as a row of cards with the
 * step number carried large in the mono face and a rule above each one — the
 * rule reads as a progress track across the row at desktop width.
 *
 * Step 1's rule is the spark; the rest are sky. That is the one place on this
 * band red is spent, and it marks the step the visitor is actually being asked
 * to take.
 */
export async function WhatHappensNext() {
  const t = await getTranslations("Home.process");

  const steps = [
    {
      number: t("step01Number"),
      title: t("step01Title"),
      time: t("step01Time"),
      body: t("step01Body"),
    },
    {
      number: t("step02Number"),
      title: t("step02Title"),
      time: t("step02Time"),
      body: t("step02Body"),
    },
    {
      number: t("step03Number"),
      title: t("step03Title"),
      time: t("step03Time"),
      body: t("step03Body"),
    },
    {
      number: t("step04Number"),
      title: t("step04Title"),
      time: t("step04Time"),
      body: t("step04Body"),
    },
  ];

  return (
    <section id="process" className="py-16 sm:py-24">
      <div className="max-w-content mx-auto px-4 sm:px-6">
        <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
          {t("eyebrow")}
        </p>

        <h2 className="font-display text-foreground mt-4 max-w-2xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {t("headline")}
        </h2>

        <ol className="mt-12 grid list-none grid-cols-1 gap-8 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.number} className="flex flex-col gap-4">
              <span
                aria-hidden="true"
                className={`block h-0.5 w-full ${i === 0 ? "bg-spark" : "bg-secondary/40"}`}
              />
              <span
                dir="ltr"
                className="text-accent font-mono text-2xl font-medium"
              >
                {step.number}
              </span>
              <div>
                <h3 className="font-display text-foreground text-lg font-bold">
                  {step.title}
                </h3>
                <p className="text-muted-foreground mt-1 font-mono text-xs">
                  {step.time}
                </p>
              </div>
              <p className="font-body text-muted-foreground text-sm leading-relaxed">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
