"use client";

import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const FILTER_VALUES = [
  "all",
  "software",
  "ecommerce",
  "web",
  "social",
] as const;
export type FilterValue = (typeof FILTER_VALUES)[number];

interface WorkFilterProps {
  currentFilter: FilterValue;
  labels: Record<FilterValue, string>;
  ariaLabel: string;
}

export function WorkFilter({
  currentFilter,
  labels,
  ariaLabel,
}: WorkFilterProps) {
  const router = useRouter();
  const pathname = usePathname();

  const setFilter = (value: FilterValue) => {
    const query = value === "all" ? "" : `?filter=${value}`;
    router.replace(`${pathname}${query}`, { scroll: false });
  };

  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {FILTER_VALUES.map((value) => {
        const isActive = currentFilter === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={isActive}
            onClick={() => setFilter(value)}
            className={cn(
              "focus-visible:ring-ring rounded-sm px-4 py-1.5 font-mono text-xs tracking-widest uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-surface-variant text-muted-foreground hover:bg-surface-container",
            )}
          >
            {labels[value]}
          </button>
        );
      })}
    </div>
  );
}
