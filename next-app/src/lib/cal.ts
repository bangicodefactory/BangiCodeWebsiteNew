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
