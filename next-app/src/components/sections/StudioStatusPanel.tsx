import { LocalClock } from "@/components/LocalClock";

export interface StudioStatusPanelProps {
  ariaLabel: string;
  online: string;
  sprintLabel: string;
  sprint: string;
  availabilityLabel: string;
  availability: string;
  teamLabel: string;
  team: string;
  timeLabel: string;
  /**
   * `panel` — the standalone navy card (smoke gallery, any light page).
   * `strip` — a single mono rule, for use inside an already-dark band. This is
   *           how the homepage hero carries it: Design D has no slot for a
   *           status card, but the live sprint / next-availability / local-time
   *           metadata is a real differentiator and fits D's "thin technical
   *           texture" language. See ADR 0001.
   */
  variant?: "panel" | "strip";
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground font-mono text-xs">{label}</span>
      <span className="text-foreground text-end font-mono text-xs">
        {value}
      </span>
    </div>
  );
}

function OnlineDot() {
  // The active dot — spark red. Was a raw #ffb4a9; retired in ADR 0001.
  return (
    <span
      className="bg-spark h-2 w-2 shrink-0 rounded-full"
      aria-hidden="true"
    />
  );
}

export function StudioStatusPanel({
  ariaLabel,
  online,
  sprintLabel,
  sprint,
  availabilityLabel,
  availability,
  teamLabel,
  team,
  timeLabel,
  variant = "panel",
}: StudioStatusPanelProps) {
  if (variant === "strip") {
    return (
      <aside
        aria-label={ariaLabel}
        className="border-border flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t pt-6"
      >
        <span className="flex items-center gap-2">
          <OnlineDot />
          <span className="text-foreground font-mono text-xs tracking-widest uppercase">
            {online}
          </span>
        </span>
        <span className="text-muted-foreground font-mono text-xs">
          {sprintLabel} <span className="text-foreground">{sprint}</span>
        </span>
        <span className="text-muted-foreground font-mono text-xs">
          {availabilityLabel}{" "}
          <span className="text-foreground">{availability}</span>
        </span>
        <span className="text-muted-foreground font-mono text-xs">
          {teamLabel} <span className="text-foreground">{team}</span>
        </span>
        <LocalClock timeLabel={timeLabel} className="justify-start" />
      </aside>
    );
  }

  /*
   * data-surface="dark" so the card carries its own navy scope. That lets every
   * child use plain foreground / muted-foreground semantics and stay correct
   * whether the page around it is light or dark.
   */
  return (
    <aside
      aria-label={ariaLabel}
      data-surface="dark"
      className="bg-card border-border space-y-4 rounded-md border p-5 text-sm"
    >
      <div className="flex items-center gap-2">
        <OnlineDot />
        <span className="text-foreground font-mono text-xs tracking-widest uppercase">
          {online}
        </span>
      </div>

      <div className="space-y-3">
        <Row label={sprintLabel} value={sprint} />
        <Row label={availabilityLabel} value={availability} />
        <Row label={teamLabel} value={team} />
        <LocalClock timeLabel={timeLabel} />
      </div>
    </aside>
  );
}
