"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { trackWhatsappClick } from "@/lib/analytics";

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? "212664571370";

export function WhatsAppCta() {
  const t = useTranslations("WhatsAppCta");
  const tCommon = useTranslations("Common");
  /*
   * The new-tab note is appended to the LABEL rather than added as an sr-only
   * child, because aria-label replaces the accessible name — a child element
   * here would never be announced. Every other outbound link on the site uses
   * <NewTabHint /> for this; this one cannot.
   */
  const newTabLabel = `${t("ariaLabel")} ${tCommon("opensInNewTab")}`;
  const [inputFocused, setInputFocused] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  /*
   * Step aside once the footer is on screen.
   *
   * The button is `fixed bottom-5 end-5`, and the footer's legal row sits in
   * that same corner — so at the bottom of the page it covered the "Cookies"
   * link by 77% on desktop and `elementFromPoint` at the link's own centre
   * returned the BUTTON. The link was unclickable, and keyboard focus landed
   * underneath it (WCAG 2.2 SC 2.4.11). Every page shares the footer, so this
   * was every page.
   *
   * This was hidden for as long as it was because the old scroll-direction
   * hiding masked it: the button was always gone by the time you reached the
   * footer. Removing that hiding is what exposed it.
   *
   * Keyed on the footer intersecting rather than on scroll direction, so the
   * button stays put while reading — which is the entire point of the change —
   * and only yields where it would actually obscure something.
   */
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;
    const io = new IntersectionObserver(
      (entries) => setFooterVisible(entries.some((e) => e.isIntersecting)),
      // Let the footer come properly into view before yielding, so the button
      // does not flicker away on a scroll that merely grazes it.
      { rootMargin: "0px 0px -48px 0px" },
    );
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const INPUT_SELECTOR = "input, textarea, select";
    function onFocusIn(e: FocusEvent) {
      if (e.target instanceof Element && e.target.matches(INPUT_SELECTOR))
        setInputFocused(true);
    }
    function onFocusOut(e: FocusEvent) {
      if (e.target instanceof Element && e.target.matches(INPUT_SELECTOR)) {
        // Defer so that focusin on the next input fires first during tab navigation.
        setTimeout(() => {
          if (!document.activeElement?.matches(INPUT_SELECTOR))
            setInputFocused(false);
        }, 0);
      }
    }
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  /*
   * It used to hide whenever you scrolled DOWN past 80px and return on the way
   * up (`visible = y < lastScrollY || y < 80`, here since BAN-136). That is the
   * right pattern for a sticky nav bar, which competes with the page for
   * reading space. This is a 56px circle in a corner and it is the conversion
   * CTA, so it was disappearing at precisely the moment someone reads far
   * enough into a service page or case study to want to make contact.
   *
   * What remains are the two cases where it is genuinely in the way: over a
   * field being typed into, and over the footer.
   */
  const hidden = inputFocused || footerVisible;
  const href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(t("prefill"))}`;

  const handleClick = useCallback(() => {
    trackWhatsappClick(window.location.pathname);
  }, []);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={newTabLabel}
      data-testid="whatsapp-cta"
      onClick={handleClick}
      className={cn(
        // bottom-5 was a flat 20px, which on a device with a home indicator
        // puts a 56px circle partly inside the gesture strip. max() keeps the
        // same 20px where there is no inset and lifts it clear where there is.
        "fixed end-5 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-40",
        "flex h-14 w-14 items-center justify-center rounded-full",
        // WhatsApp brand green is intentionally NOT a bangicode token — it is
        // a third-party brand mark and must stay recognisable.
        "bg-[#25D366] text-white shadow-lg",
        // 300ms, not the 200ms used for hovers: this carries the button
        // sliding out of and back into the corner (translate-y-20 + opacity)
        // when a field takes focus or the footer arrives, and that wants a
        // slower, calmer curve than a button responding to a pointer. The
        // duration lives here because transition-interactive deliberately does
        // not set one — see the note in globals.css.
        "transition-interactive duration-300 ease-out motion-reduce:transition-none",
        "hover:scale-110",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        hidden &&
          "pointer-events-none translate-y-20 opacity-0 motion-reduce:hidden",
      )}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-7 w-7 fill-current"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
      </svg>
    </a>
  );
}
