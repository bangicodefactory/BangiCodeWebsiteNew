import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

interface PeekCard {
  client: string;
  description: string;
  stack: readonly string[];
  industry: string;
  href: string;
}

function PeekCardItem({ card }: { card: PeekCard }) {
  return (
    <Link
      href={card.href}
      className="group border-border bg-card hover:border-secondary focus-visible:ring-ring transition-interactive flex flex-col gap-4 rounded-md border p-6 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:outline-none"
    >
      <h3 className="font-display text-foreground text-lg font-bold">
        {card.client}
      </h3>
      <p className="font-body text-muted-foreground grow text-sm leading-relaxed">
        {card.description}
      </p>
      <div className="flex flex-wrap gap-2">
        {[...card.stack, card.industry].map((tag) => (
          <span
            key={tag}
            className="text-muted-foreground bg-muted rounded-full px-2.5 py-1 font-mono text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}

/*
 * Bottom half of the dark portfolio band — three equal project cards, as in
 * Design D. Shares FeaturedCase's dark surface and is joined to it by a
 * hairline; the two read as one band.
 *
 * Card copy still comes from Home.peekCards rather than work/projects.ts. The
 * plan floated switching the data source, but the three summaries here are
 * translated in all three catalogs and projects.ts is about to be renamed in
 * Phase 6 — repointing now would mean touching it twice.
 */
export async function PeekCards() {
  const t = await getTranslations("Home.peekCards");

  const cards: PeekCard[] = [
    {
      client: t("coinluminaireClient"),
      description: t("coinluminaireDesc"),
      stack: ["React", "MongoDB"],
      industry: t("coinluminaireIndustry"),
      href: "/portfolio/coinluminaire",
    },
    {
      client: t("classkomClient"),
      description: t("classkomDesc"),
      stack: ["React", "Laravel"],
      industry: t("classkomIndustry"),
      href: "/portfolio/classkom",
    },
    {
      client: t("aqarchamalClient"),
      description: t("aqarchamalDesc"),
      stack: ["Laravel", "Bootstrap"],
      industry: t("aqarchamalIndustry"),
      href: "/portfolio/aqarchamal",
    },
  ];

  return (
    <section
      id="more-work"
      data-surface="dark"
      className="border-border bg-background border-t py-16 sm:py-20"
    >
      <div className="max-w-content mx-auto px-4 sm:px-6">
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

        <Link
          href="/portfolio"
          className="group text-secondary-container focus-visible:ring-ring mt-10 inline-flex items-center gap-1.5 rounded-sm font-mono text-sm focus-visible:ring-2 focus-visible:outline-none"
        >
          {t("ctaAll")}
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
          />
        </Link>
      </div>
    </section>
  );
}
