"use client";

import { useId, useState, type ReactNode } from "react";
import { AlertCircle, Check } from "lucide-react";
import type { Locale } from "@/i18n/routing";

/**
 * Tabs for the three locales of one piece of content.
 *
 * Two things this does deliberately:
 *
 * 1. Inactive panels are hidden with the `hidden` attribute rather than
 *    unmounted. Hidden inputs still submit, so the whole trilingual document
 *    posts in one FormData — no client-side serialisation, and nothing is lost
 *    if the user never opens a tab.
 *
 * 2. Each tab shows whether its locale is complete or has errors. With
 *    "all three locales required to publish", the failure mode to design
 *    against is someone filling in English, hitting publish, and then hunting
 *    for what is wrong in a language they may not read.
 */
export function LocaleTabs({
  locales,
  labels,
  status,
  renderPanel,
}: {
  /*
   * A non-empty tuple, not Locale[] — the first entry is the initial tab, and
   * under noUncheckedIndexedAccess a plain array makes locales[0] possibly
   * undefined. routing.locales already satisfies this shape.
   */
  locales: readonly [Locale, ...Locale[]];
  labels: Record<string, string>;
  /** Per-locale completeness, for the tab indicator. */
  status: Record<string, "complete" | "incomplete" | "error">;
  renderPanel: (locale: Locale) => ReactNode;
}) {
  const [active, setActive] = useState<Locale>(locales[0]);
  const baseId = useId();

  return (
    <div>
      <div
        role="tablist"
        aria-label="Content language"
        className="border-border flex gap-1 border-b"
      >
        {locales.map((locale) => {
          const state = status[locale] ?? "incomplete";
          const selected = active === locale;
          return (
            <button
              key={locale}
              type="button"
              role="tab"
              id={`${baseId}-tab-${locale}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${locale}`}
              onClick={() => setActive(locale)}
              className={`focus-visible:ring-ring -mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 font-mono text-xs tracking-wider uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                selected
                  ? "border-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              }`}
            >
              {labels[locale] ?? locale}
              {state === "error" ? (
                <AlertCircle
                  aria-label="has errors"
                  className="text-destructive size-3.5"
                />
              ) : state === "complete" ? (
                <Check
                  aria-label="complete"
                  className="text-success size-3.5"
                />
              ) : (
                <span
                  aria-label="incomplete"
                  className="bg-outline size-1.5 rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>

      {locales.map((locale) => (
        <div
          key={locale}
          role="tabpanel"
          id={`${baseId}-panel-${locale}`}
          aria-labelledby={`${baseId}-tab-${locale}`}
          hidden={active !== locale}
          className="pt-6"
        >
          {/* Rendered even when hidden — see note above. */}
          {renderPanel(locale)}
        </div>
      ))}
    </div>
  );
}
