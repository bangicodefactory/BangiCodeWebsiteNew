import { StudioStatusPanel } from "@/components/sections/StudioStatusPanel";

export default function SmokeStudioStatusPanelPage() {
  return (
    <main className="bg-background min-h-screen p-12">
      <div className="mx-auto max-w-sm">
        <StudioStatusPanel
          online="● online"
          sprintLabel="current sprint"
          sprint="E2 — Design system"
          availabilityLabel="next opening"
          availability="late July 2026"
          teamLabel="team size"
          team="2 engineers"
          timeLabel="Tetouan time"
        />
      </div>
    </main>
  );
}
