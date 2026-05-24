"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

function LocalClock({ timeLabel }: { timeLabel: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    function format() {
      return new Date().toLocaleTimeString("en-GB", {
        timeZone: "Africa/Casablanca",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    // Initial sync via rAF (satisfies react-hooks/set-state-in-effect)
    const rafId = requestAnimationFrame(() => setTime(format()));
    const id = setInterval(() => setTime(format()), 60_000);
    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(id);
    };
  }, []);

  return (
    <div className="flex items-center justify-between">
      <span className="text-primary-foreground/60 font-mono text-xs">
        {timeLabel}
      </span>
      <span className="text-primary-foreground font-mono text-xs">
        {time ?? "--:--"}
      </span>
    </div>
  );
}

interface StudioStatusPanelProps {
  online: string;
  sprintLabel: string;
  sprint: string;
  availabilityLabel: string;
  availability: string;
  teamLabel: string;
  team: string;
  timeLabel: string;
}

function StudioStatusPanel({
  online,
  sprintLabel,
  sprint,
  availabilityLabel,
  availability,
  teamLabel,
  team,
  timeLabel,
}: StudioStatusPanelProps) {
  return (
    <aside
      aria-label="Studio status"
      className="bg-primary space-y-4 rounded-sm p-5 text-sm"
    >
      <div className="flex items-center gap-2">
        {/* tertiary-fixed-dim — the single legitimate raw hex per CLAUDE.md */}
        <span
          className="h-2 w-2 flex-shrink-0 rounded-full"
          style={{ backgroundColor: "#ffb4a9" }}
          aria-hidden="true"
        />
        <span className="text-primary-foreground font-mono text-xs tracking-widest uppercase">
          {online}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <span className="text-primary-foreground/60 font-mono text-xs">
            {sprintLabel}
          </span>
          <span className="text-primary-foreground text-right font-mono text-xs">
            {sprint}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-primary-foreground/60 font-mono text-xs">
            {availabilityLabel}
          </span>
          <span className="text-primary-foreground text-right font-mono text-xs">
            {availability}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-primary-foreground/60 font-mono text-xs">
            {teamLabel}
          </span>
          <span className="text-primary-foreground text-right font-mono text-xs">
            {team}
          </span>
        </div>
        <LocalClock timeLabel={timeLabel} />
      </div>
    </aside>
  );
}

export function HeroSection() {
  const t = useTranslations("Home.hero");
  const ts = useTranslations("Home.status");

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
