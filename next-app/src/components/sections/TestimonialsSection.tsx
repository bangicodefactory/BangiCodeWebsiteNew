import { getTranslations } from "next-intl/server";

/*
 * Design D lays this out as a three-up grid. We have one real quote and CLAUDE.md
 * locks it — inventing two more to fill the grid would be fabricating client
 * testimony. It stays a single centred card, and keeps data-placeholder="true"
 * so it is grep-able the day a second real quote arrives.
 */
export async function TestimonialsSection() {
  const t = await getTranslations("Home.testimonial");

  return (
    <section
      id="testimonials"
      className="border-border bg-surface-container border-y py-20 sm:py-28 lg:py-32"
    >
      <div className="max-w-content mx-auto px-4 sm:px-6">
        {/*
         * rounded-xl (28px) and `reveal`. A single centred quote at up to
         * 1056×360 is the largest isolated surface on the page, and at 20px it
         * was the one panel whose corners read tighter than everything around
         * it. One card, so a plain reveal rather than a stagger — there is
         * nothing here to sequence against.
         */}
        <figure
          className="reveal border-border bg-card mx-auto max-w-3xl rounded-xl border p-8 text-center shadow-sm sm:p-12"
          data-placeholder="true"
        >
          <span
            aria-hidden="true"
            className="font-display text-secondary-container block text-5xl leading-none select-none"
          >
            &ldquo;
          </span>
          <blockquote className="font-display text-foreground mt-4 text-xl leading-relaxed font-medium tracking-tight text-balance sm:text-2xl">
            {t("quote")}
          </blockquote>

          <figcaption className="mt-8 flex items-center justify-center gap-4">
            <div
              className="bg-primary text-primary-foreground font-display flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              aria-hidden="true"
            >
              Y
            </div>
            <div className="text-start">
              <p className="font-body text-foreground text-sm font-semibold">
                {t("author")}
              </p>
              <p className="text-muted-foreground font-mono text-xs">
                {t("company")}
              </p>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
