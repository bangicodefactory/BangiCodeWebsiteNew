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
}: StudioStatusPanelProps) {
  return (
    <aside
      aria-label={ariaLabel}
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
          <span className="text-primary-foreground text-end font-mono text-xs">
            {sprint}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-primary-foreground/60 font-mono text-xs">
            {availabilityLabel}
          </span>
          <span className="text-primary-foreground text-end font-mono text-xs">
            {availability}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-primary-foreground/60 font-mono text-xs">
            {teamLabel}
          </span>
          <span className="text-primary-foreground text-end font-mono text-xs">
            {team}
          </span>
        </div>
        <LocalClock timeLabel={timeLabel} />
      </div>
    </aside>
  );
}
