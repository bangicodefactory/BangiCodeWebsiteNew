import { getTranslations } from "next-intl/server";
import { Check, X } from "lucide-react";

/*
 * Design D's two-column comparison: a quiet white card of what usually happens
 * against a navy-filled card of how we work.
 *
 * The copy is ours, not D's. D frames this as "most agencies disappear after
 * launch" — an attack on a nameless competitor. The studio voice states its own
 * commitments instead, and each ✓ here is something already promised on
 * /process, so the two pages agree.
 *
 * The navy card scopes itself with data-surface="dark" rather than hand-picking
 * navy classes, so its text, border and icons all resolve from the same
 * semantic layer the rest of the site uses.
 */
export async function WhyBangicode() {
  const t = await getTranslations("Home.why");

  const them = [t("them01"), t("them02"), t("them03"), t("them04")];
  const us = [t("us01"), t("us02"), t("us03"), t("us04")];

  return (
    <section id="why" className="py-16 sm:py-24">
      <div className="max-w-content mx-auto px-4 sm:px-6">
        <p
          dir="ltr"
          className="text-muted-foreground font-mono text-xs tracking-widest uppercase"
        >
          {t("eyebrow")}
        </p>
        <h2 className="font-display text-foreground mt-4 max-w-3xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {t("headline")}
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          <div className="bg-card border-border rounded-lg border p-8">
            <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
              {t("themTitle")}
            </p>
            <ul className="mt-6 list-none space-y-4 p-0">
              {them.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <X
                    aria-hidden="true"
                    className="text-outline mt-0.5 size-4 shrink-0"
                  />
                  <span className="font-body text-muted-foreground text-sm leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div
            data-surface="dark"
            className="bg-card border-border shadow-brand rounded-lg border p-8"
          >
            <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
              {t("usTitle")}
            </p>
            <ul className="mt-6 list-none space-y-4 p-0">
              {us.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check
                    aria-hidden="true"
                    className="text-secondary-container mt-0.5 size-4 shrink-0"
                  />
                  <span className="font-body text-foreground text-sm leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
