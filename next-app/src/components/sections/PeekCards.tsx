import { getTranslations } from "next-intl/server";

interface PeekCard {
  client: string;
  description: string;
  stack: readonly string[];
  industry: string;
}

function PeekCardItem({ card }: { card: PeekCard }) {
  return (
    <article className="border-border bg-background flex flex-col gap-4 rounded-sm border p-6">
      <h3 className="font-display text-foreground text-lg font-bold">
        {card.client}
      </h3>
      <p className="font-body text-muted-foreground grow text-sm leading-relaxed">
        {card.description}
      </p>
      <div className="flex flex-wrap gap-2">
        {card.stack.map((tech) => (
          <span
            key={tech}
            className="text-muted-foreground bg-surface-container rounded-sm px-2 py-0.5 font-mono text-xs"
          >
            {tech}
          </span>
        ))}
        <span className="text-muted-foreground bg-surface-container rounded-sm px-2 py-0.5 font-mono text-xs">
          {card.industry}
        </span>
      </div>
    </article>
  );
}

export async function PeekCards() {
  const t = await getTranslations("Home.peekCards");

  const cards: PeekCard[] = [
    {
      client: t("coinluminaireClient"),
      description: t("coinluminaireDesc"),
      stack: ["React", "MongoDB"],
      industry: t("coinluminaireIndustry"),
    },
    {
      client: t("classkomClient"),
      description: t("classkomDesc"),
      stack: ["React", "Laravel"],
      industry: t("classkomIndustry"),
    },
    {
      client: t("aqarchamalClient"),
      description: t("aqarchamalDesc"),
      stack: ["Laravel", "Bootstrap"],
      industry: t("aqarchamalIndustry"),
    },
  ];

  return (
    <section id="more-work" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p
          dir="ltr"
          className="text-muted-foreground mb-8 font-mono text-xs tracking-widest uppercase"
        >
          {t("eyebrow")}
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <PeekCardItem key={card.client} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
