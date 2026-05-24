import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { StudioStatusPanel } from "@/components/sections/StudioStatusPanel";

export async function HeroSection() {
  const t = await getTranslations("Home.hero");
  const ts = await getTranslations("Home.status");

  return (
    <section
      id="hero"
      className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 sm:pt-32 sm:pb-24"
    >
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_320px] lg:gap-16 xl:grid-cols-[1fr_360px]">
        {/* Left column — headline + CTAs */}
        <div className="flex flex-col gap-6">
          <p
            dir="ltr"
            className="text-muted-foreground font-mono text-xs tracking-widest uppercase"
          >
            {t("eyebrow")}
          </p>

          <h1 className="font-display text-foreground text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {t("h1")}
            <br />
            <span className="text-secondary-container">{t("tagline")}</span>
          </h1>

          <p className="font-body text-muted-foreground max-w-lg text-lg leading-relaxed">
            {t("body")}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="primary" size="lg">
              <Link href="/book">{t("ctaPrimary")}</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="#work">{t("ctaSecondary")}</Link>
            </Button>
          </div>

          <p className="text-muted-foreground font-mono text-xs">
            {t("microcopy")}
          </p>
        </div>

        {/* Right column — studio status panel (desktop only) */}
        <div className="hidden lg:block">
          <StudioStatusPanel
            online={ts("online")}
            sprintLabel={ts("sprintLabel")}
            sprint={ts("sprint")}
            availabilityLabel={ts("availabilityLabel")}
            availability={ts("availability")}
            teamLabel={ts("teamLabel")}
            team={ts("team")}
            timeLabel={ts("timeLabel")}
          />
        </div>
      </div>

      {/* Mobile status panel — below CTAs, collapsed */}
      <div className="mt-10 block lg:hidden">
        <StudioStatusPanel
          online={ts("online")}
          sprintLabel={ts("sprintLabel")}
          sprint={ts("sprint")}
          availabilityLabel={ts("availabilityLabel")}
          availability={ts("availability")}
          teamLabel={ts("teamLabel")}
          team={ts("team")}
          timeLabel={ts("timeLabel")}
        />
      </div>
    </section>
  );
}
