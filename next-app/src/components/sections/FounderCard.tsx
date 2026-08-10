import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? "212664571370";

/*
 * Design D closes on a dark contact band. D puts a full form here; this does
 * not, deliberately — /contact already owns that form and its server action.
 * Duplicating it would mount a second form island on the LCP page and give the
 * two pages competing copies of the same intake. The band carries the ask and
 * hands off.
 *
 * Home.founder stays as the frame: reaching the people who build the thing is
 * more distinctive than D's anonymous "get in touch".
 *
 * It named Ahmed specifically until 2026-08-10. Bangicode has two founders —
 * Ahmed Chioua and Achraf Znagui — so a headline naming one was wrong, and
 * naming both would date the moment a third person joins. "The team" is
 * accurate at any headcount, which is why it is not "the founders" either.
 */
export async function FounderCard() {
  const t = await getTranslations("Home.founder");

  return (
    <section
      id="contact"
      data-surface="dark"
      className="bg-background relative isolate overflow-hidden py-16 sm:py-24"
    >
      <div
        aria-hidden="true"
        className="bg-spark/15 pointer-events-none absolute -bottom-40 left-1/2 -z-10 h-72 w-[36rem] -translate-x-1/2 rounded-full blur-[120px]"
      />

      <div className="max-w-content mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
            {t("label")}
          </p>

          {/*
           * The brand mark, not an initial. This was a hardcoded "A" for
           * Ahmed, which reads as one person under a headline about the team.
           * Two initials would be no better — both founders' names begin with
           * A. A neutral mark says "the studio" and never needs revisiting.
           */}
          <div
            className="bg-primary text-primary-foreground font-display mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold"
            role="img"
            aria-label={t("avatarAlt")}
          >
            B
          </div>

          <h2 className="font-display text-foreground mt-6 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {t("headline")}
          </h2>

          <p className="font-body text-muted-foreground mx-auto mt-5 max-w-lg text-base leading-relaxed">
            {t("body")}
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="spark" size="lg">
              <Link href="/book">{t("ctaPrimary")}</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/contact">{t("ctaSecondary")}</Link>
            </Button>
          </div>

          <p className="text-muted-foreground mt-6 font-mono text-xs">
            {t("ctaSecondaryPrefix")}{" "}
            <a
              href={`https://wa.me/${WA_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground focus-visible:ring-ring rounded-sm underline underline-offset-4 transition-opacity duration-200 ease-out hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
            >
              {t("whatsapp")}
            </a>
            {" · "}
            <a
              href={`mailto:${t("email")}`}
              className="text-foreground focus-visible:ring-ring rounded-sm underline underline-offset-4 transition-opacity duration-200 ease-out hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
            >
              {t("email")}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
