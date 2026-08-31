/*
 * The configured Cal.com event, resolved once.
 *
 * Lives outside CalEmbed.tsx so the /book server component can ask whether
 * booking is configured WITHOUT pulling a "use client" module into the server
 * graph. Both read the same expression, so the widget and the preconnect hints
 * can never disagree about whether Cal.com is in play.
 *
 * There is deliberately no default. There was one — "bangicode/30min-discovery"
 * — and that event has never existed, so cal.com answered 404 for it. Because
 * the 404 lands inside the cross-origin iframe, nothing on our side can observe
 * it: the fallback never fired and visitors got Cal.com's error page framed
 * inside ours. Unconfigured must therefore be an explicit, inert state.
 *
 * NEXT_PUBLIC_* is inlined at BUILD time, so this is fixed when `next build`
 * runs — setting it on the server changes nothing. CI passes it from a repo
 * variable; see the "Build standalone bundle" step in .github/workflows/ci.yml.
 */
export const CAL_EVENT_SLUG: string | undefined =
  process.env.NEXT_PUBLIC_CAL_EVENT_SLUG?.trim() || undefined;

/** True when a Cal.com event is configured and the embed should be attempted. */
export const isBookingConfigured = CAL_EVENT_SLUG !== undefined;

/*
 * Addresses added to every booking made through the site, so both founders are
 * on the invite without the visitor having to know to add anyone.
 *
 * This works by PREFILLING Cal.com's built-in "Add guests" booking question —
 * its identifier is `guests`, and Cal.com prefills any booking question from a
 * matching URL parameter. There is no "default value" setting on the question
 * itself; prefill is the mechanism Cal.com provides.
 *
 * Two consequences worth knowing:
 *
 *  - It only covers bookings made through THIS SITE, because the prefill rides
 *    on the embed URL. Someone opening cal.com/<user>/<event> directly gets the
 *    empty field. Covering every route needs a Collective team event, where the
 *    second person is a HOST rather than a guest.
 *  - The visitor can still edit the field, so they can add their own colleagues
 *    — and could in principle remove a default guest. Locking it is possible
 *    ("Disable input if the URL identifier is prefilled" on the question), but
 *    that disables the whole field and takes the visitor's ability to add
 *    anyone with it. Left editable deliberately.
 *
 * Comma-separated. Unset means no default guests, which is the correct
 * behaviour for a fork of this site that has no second founder.
 */
export const CAL_GUESTS: string[] = (process.env.NEXT_PUBLIC_CAL_GUESTS ?? "")
  .split(",")
  .map((email) => email.trim())
  .filter(Boolean);
