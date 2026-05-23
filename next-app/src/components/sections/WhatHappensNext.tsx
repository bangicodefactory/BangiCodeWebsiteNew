import { getTranslations } from "next-intl/server";

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
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p
          dir="ltr"
          className="text-muted-foreground mb-4 font-mono text-xs tracking-widest uppercase"
        >
          {t("eyebrow")}
        </p>

        <h2 className="font-display text-foreground mb-12 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
          {t("headline")}
        </h2>

        <ol className="bg-border grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <li
              key={step.number}
              className="bg-background flex flex-col gap-4 p-8"
            >
              <span
                dir="ltr"
                className="text-secondary-container font-mono text-xs"
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
