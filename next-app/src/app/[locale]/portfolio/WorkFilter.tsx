import { Link } from "@/i18n/navigation";
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

/**
 * Filter chips as LINKS, rendered on the server.
 *
 * These were buttons calling router.replace, which forced the whole project
 * list into a client component behind a Suspense boundary (useSearchParams
 * requires one). The page therefore painted with an empty hole and injected
 * twelve cards after hydration — CLS 0.78 against a project budget of 0.05,
 * and the reason Lighthouse scored this page 0.76 on performance.
 *
 * A filter is a URL, so links are also the more honest control: they are
 * middle-clickable, shareable, and work with JavaScript disabled.
 */
export function WorkFilter({
  currentFilter,
  labels,
  ariaLabel,
}: WorkFilterProps) {
  return (
    <nav aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {FILTER_VALUES.map((value) => {
        const isActive = currentFilter === value;
        return (
          <Link
            key={value}
            href={value === "all" ? "/portfolio" : `/portfolio?filter=${value}`}
            scroll={false}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "focus-visible:ring-ring rounded-sm px-4 py-1.5 font-mono text-xs tracking-widest uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-surface-variant text-muted-foreground hover:bg-surface-container",
            )}
          >
            {labels[value]}
          </Link>
        );
      })}
    </nav>
  );
}
