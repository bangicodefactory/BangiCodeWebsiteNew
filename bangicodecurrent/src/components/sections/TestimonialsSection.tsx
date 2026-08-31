import { getTranslations } from "next-intl/server";
import { NewTabHint } from "@/components/NewTabHint";

/** The client's own site, so the quote can be checked rather than taken on trust. */
const TESTIMONIAL_URL = "https://directonderweg.com/";

/*
 * Design D lays this out as a three-up grid. We have one quote, and inventing
 * two more to fill the grid would be fabricating client testimony. It stays a
 * single centred card.
 *
 * Attribution changed 2026-09-01: Imane B. at Direct Onderweg, replacing
 * Youssef B. at Friterie.ma. The author, company and URL are the only things
 * that moved.
 *
 * ⚠ `data-placeholder="true"` STAYS until someone confirms the wording.
 *
 * The attribute marks the QUOTE as unverified, not the person. The sentence
 * below is still the copy that was written when this card was a stand-in, and
 * it is now signed by a named individual at a real, linked company — so until
 * someone confirms Imane actually said it, the marker is what stops an invented
 * sentence from being read as sourced testimony. Removing it is a one-word
 * change the moment that confirmation exists.
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
            {/*
             * The initial is DERIVED from the translated author, not typed in.
             * It was a hardcoded "Y" for Youssef, which is exactly how it went
             * stale: the name changed in three catalogs and the avatar kept
             * showing the old person's letter. It was also wrong on /ar even
             * before that — a Latin "Y" sat beside "يوسف ب.".
             *
             * Decorative only (aria-hidden): the accessible name comes from the
             * author line below, so a screen reader never hears the letter.
             */}
            <div
              className="bg-primary text-primary-foreground font-display flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              aria-hidden="true"
            >
              {t("author").trim().charAt(0)}
            </div>
            <div className="text-start">
              <p className="font-body text-foreground text-sm font-semibold">
                {t("author")}
              </p>
              {/*
               * The company links out to the client's own site. A testimonial
               * that cannot be checked is worth very little, and the whole
               * point of naming a real client is that a visitor can go and look.
               *
               * Plain <a>, not next-intl's <Link>: this leaves the site, so it
               * must not pick up a locale prefix. rel="noopener" is required
               * with target="_blank", and NewTabHint is how every other
               * outbound link here announces itself.
               */}
              <p className="text-muted-foreground font-mono text-xs">
                <a
                  href={TESTIMONIAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-visible:ring-ring hover:text-foreground rounded-sm underline-offset-4 transition-colors duration-200 ease-out hover:underline focus-visible:ring-2 focus-visible:outline-none"
                >
                  {t("company")}
                  <NewTabHint />
                </a>
              </p>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
