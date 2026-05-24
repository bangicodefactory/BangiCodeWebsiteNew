import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? "212664571370";

export async function FounderCard() {
  const t = await getTranslations("Home.founder");

  return (
    <section
      id="contact"
      className="bg-surface-container border-border border-t py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-muted-foreground mb-4 font-mono text-xs tracking-widest uppercase">
            {t("label")}
          </p>

          <div
            className="bg-primary text-primary-foreground font-display mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold"
            aria-label={t("avatarAlt")}
          >
            A
          </div>

          <h2 className="font-display text-foreground mb-8 text-2xl font-bold tracking-tight sm:text-3xl">
            {t("headline")}
          </h2>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild variant="primary" size="lg">
              <Link href="/book">{t("ctaPrimary")}</Link>
            </Button>

            <p className="text-muted-foreground font-mono text-xs">
              {t("ctaSecondaryPrefix")}{" "}
              <a
                href={`https://wa.me/${WA_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground focus-visible:ring-ring rounded-sm underline underline-offset-4 hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
              >
                {t("whatsapp")}
              </a>
              {" · "}
              <a
                href={`mailto:${t("email")}`}
                className="text-foreground focus-visible:ring-ring rounded-sm underline underline-offset-4 hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
              >
                {t("email")}
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
