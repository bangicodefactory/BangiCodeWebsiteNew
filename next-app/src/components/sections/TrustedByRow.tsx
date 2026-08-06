import { getTranslations } from "next-intl/server";

const CLIENTS = [
  "Cafe Imperial",
  "Friterie.ma",
  "Aqarchamal",
  "Classkom",
  "Coinluminaire",
  "Riha",
] as const;

/*
 * Light trust strip. First light band after the dark hero, so it is deliberately
 * quiet: one mono label, six wordmarks set in the display face, nothing else.
 */
export async function TrustedByRow() {
  const t = await getTranslations("Home.trustedBy");

  return (
    <section
      id="trusted-by"
      aria-label={t("label")}
      className="border-border bg-surface-container border-b py-10"
    >
      <div className="max-w-content mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center gap-6">
          <p className="text-muted-foreground font-mono text-xs tracking-widest whitespace-nowrap uppercase">
            {t("label")}
          </p>
          {/*
           * text-muted-foreground, not text-foreground/55. The faded treatment
           * is the convention for a logo wall, but an opacity that reads as
           * "quiet" on white lands at #777c85 over this band's ink-100 — 3.7:1,
           * which fails AA and was the only contrast failure Lighthouse found.
           * muted-foreground is the token that already means "quiet" and clears
           * AA at 6.4:1 here.
           */}
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {CLIENTS.map((name) => (
              <span
                key={name}
                className="font-display text-muted-foreground hover:text-foreground text-base font-semibold tracking-tight transition-colors duration-200 ease-out"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
