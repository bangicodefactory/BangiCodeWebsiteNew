"use client";

import { useEffect, useState } from "react";

export function LocalClock({ timeLabel }: { timeLabel: string }) {
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
