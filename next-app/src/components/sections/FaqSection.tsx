import { getTranslations } from "next-intl/server";
import { ChevronDown } from "lucide-react";

/*
 * Built on native <details>/<summary> rather than an Accordion primitive.
 *
 * The browser gives us the disclosure semantics, keyboard handling and
 * focus behaviour for free, it works before hydration, and it keeps this off
 * the client bundle entirely — which matters because the FAQ sits below the
 * fold on the LCP page. CLAUDE.md still lists an Accordion primitive as "to
 * build"; nothing here needs it.
 *
 * The five answers are the same ones /services gives. They are copied into
 * Home.faq at catalog level rather than cross-read, so each page owns its
 * strings, but they were seeded from Services.overview so the two cannot drift
 * into contradicting each other silently.
 */
export async function FaqSection() {
  const t = await getTranslations("Home.faq");

  const items = [
    { q: t("q01"), a: t("a01") },
    { q: t("q02"), a: t("a02") },
    { q: t("q03"), a: t("a03") },
    { q: t("q04"), a: t("a04") },
    { q: t("q05"), a: t("a05") },
  ];

  return (
    <section id="faq" className="py-20 sm:py-28 lg:py-32">
      <div className="max-w-content mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
            {t("eyebrow")}
          </p>
          <h2 className="font-display text-foreground mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {t("headline")}
          </h2>

          {/*
           * `faq-list` is what turns these into animated disclosures. Native
           * <details> opens in a single frame: the answer appears at full height
           * and everything below it jumps down by that much, which on a
           * five-row list is the most abrupt motion on the page precisely
           * because it is not motion at all.
           *
           * The rules live in globals.css on `::details-content`, so the height
           * is the browser's own measurement of the answer and there is no
           * JavaScript, no ref and no measured pixel value here. Where the
           * pseudo-element is unsupported the rules never parse and this is the
           * plain <details> it has always been.
           *
           * `reveal-stagger` on the same element as well: the rows are already
           * a vertical list, so each one reaches its range at a different scroll
           * position and the per-child offsets only sharpen a cadence the
           * geometry is producing anyway.
           */}
          <div className="faq-list reveal-stagger border-border mt-10 border-t">
            {items.map((item) => (
              <details key={item.q} className="group border-border border-b">
                <summary className="focus-visible:ring-ring flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm py-5 focus-visible:ring-2 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
                  <span className="font-display text-foreground text-base font-semibold tracking-tight text-balance sm:text-lg">
                    {item.q}
                  </span>
                  {/* 300ms, matching the disclosure it is announcing. At the
                      old 200ms the chevron finished turning while the answer
                      was still a third of the way open. */}
                  <ChevronDown
                    aria-hidden="true"
                    className="text-accent size-5 shrink-0 transition-transform duration-300 ease-out group-open:rotate-180"
                  />
                </summary>
                <p className="font-body text-muted-foreground pb-5 text-sm leading-relaxed text-pretty">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
