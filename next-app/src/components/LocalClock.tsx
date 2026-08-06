"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/*
 * Surface-agnostic: uses muted-foreground / foreground rather than
 * primary-foreground, so it reads correctly both inside StudioStatusPanel's
 * navy card and inline in the hero's mono strip.
 */
export function LocalClock({
  timeLabel,
  className,
}: {
  timeLabel: string;
  className?: string;
}) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    function format() {
      return new Date().toLocaleTimeString("en-GB", {
        timeZone: "Africa/Casablanca",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    const rafId = requestAnimationFrame(() => setTime(format()));
    const id = setInterval(() => setTime(format()), 60_000);
    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(id);
    };
  }, []);

  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <span className="text-muted-foreground font-mono text-xs">
        {timeLabel}
      </span>
      {/* tabular-nums so the minute rolling over never nudges the layout */}
      <span
        dir="ltr"
        className="text-foreground font-mono text-xs tabular-nums"
      >
        {time ?? "--:--"}
      </span>
    </div>
  );
}
