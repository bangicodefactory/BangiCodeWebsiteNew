import { getTranslations } from "next-intl/server";

const CLIENTS = [
  "Cafe Imperial",
  "Friterie.ma",
  "Aqarchamal",
  "Classkom",
  "Coinluminaire",
  "Riha",
] as const;

export async function TrustedByRow() {
  const t = await getTranslations("Home.trustedBy");

  return (
    <section
      id="trusted-by"
      aria-label={t("label")}
      className="border-border bg-surface-container border-y py-8"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <p className="text-muted-foreground font-mono text-xs tracking-widest whitespace-nowrap uppercase">
            {t("label")}
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            {CLIENTS.map((name) => (
              <span
                key={name}
                className="font-display text-foreground/60 text-sm font-semibold tracking-tight"
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
