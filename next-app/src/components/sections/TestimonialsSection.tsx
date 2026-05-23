import { getTranslations } from "next-intl/server";

export async function TestimonialsSection() {
  const t = await getTranslations("Home.testimonial");

  return (
    <section id="testimonials" className="bg-surface-container py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <figure className="mx-auto max-w-2xl" data-placeholder="true">
          <blockquote className="font-display text-foreground text-xl leading-relaxed font-medium tracking-tight sm:text-2xl">
            <span
              className="text-secondary-container text-4xl leading-none select-none"
              aria-hidden="true"
            >
              &ldquo;
            </span>
            {t("quote")}
            <span
              className="text-secondary-container text-4xl leading-none select-none"
              aria-hidden="true"
            >
              &rdquo;
            </span>
          </blockquote>

          <figcaption className="mt-8 flex items-center gap-4">
            <div
              className="bg-primary text-primary-foreground font-display flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              aria-hidden="true"
            >
              Y
            </div>
            <div>
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
