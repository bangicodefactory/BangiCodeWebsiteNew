# ADR 0004 — Calendly for booking, replacing Cal.com

**Status:** accepted · **Date:** 2026-08-10 · **Supersedes:** the "Booking: Cal.com via `@calcom/embed-react`" line in CLAUDE.md's tech stack rules

## Context

CLAUDE.md listed Cal.com as the booking provider, and the integration was
built: `src/components/CalEmbed.tsx`, an inline embed on `/book`, an error
boundary with an email and WhatsApp fallback, analytics on
`bookingSuccessful`, and locale passthrough.

It had never worked. The event it pointed at —
`cal.com/bangicode/30min-discovery`, both the `.env.local` value and the code's
default — **returns 404**. No Cal.com account was ever created, so every
visitor who clicked "Book 30 min" reached a page whose widget failed and fell
through to the email fallback.

That is worth stating plainly, because it changes what this decision costs: the
code was real, the booking was not.

## Decision

**Calendly replaces Cal.com**, at the owner's request, with bookings landing in
the `ahmedchioua@gmail.com` Google Calendar.

The two products solve the same problem and both sync to Google Calendar; this
is a vendor preference, not a technical finding. Since neither was actually
connected, switching costs nothing that was working.

**No new dependency.** `react-calendly` exists, but Calendly's inline widget is
a script tag and a div — the wrapper adds a package to the graph for about
thirty lines of code. This project has already shipped two bugs caused by a
dependency that resolved on a developer machine and not where the code ran
(`@mdx-js/mdx`, then `mysql2` inside the standalone bundle), so the bar for
adding one is higher than usual. `@calcom/embed-react` and `@calcom/embed-core`
are removed.

**The event URL is configuration, not code.** `NEXT_PUBLIC_CALENDLY_URL` — with
the same fallback behaviour Cal.com had, so an unconfigured deploy shows email
and WhatsApp rather than an empty box. The old integration hardcoded a default
slug, which is exactly how a dead link survived unnoticed.

**Booking completion is handled by postMessage, not by Calendly's redirect.**
Calendly's "redirect to external site" is a per-event setting in their
dashboard, unreachable from code and easy to forget when someone creates a
second event type. Listening for `calendly.event_scheduled` keeps the existing
`?booked=true` toast working, keeps the confirmation on our own domain, and
survives an event type being recreated. The handler checks
`event.origin === "https://calendly.com"`, without which any page could forge a
booking and redirect the visitor.

## Consequences

- Booking works once the owner creates the event and sets the variable. **Both
  steps are theirs**: creating a Calendly account and connecting it to Google
  Calendar happen in Calendly's dashboard over Google OAuth, and no amount of
  code in this repo can perform them.
- **Locale passthrough is lost.** Cal.com accepted a `locale` config value;
  Calendly's inline widget has no equivalent and detects the browser's
  language. A French visitor on `/fr/book` may see an English widget. Worth
  knowing before it is reported as a bug.
- The widget loads third-party JavaScript and sets Calendly's own cookies. It
  is on `/book` only — a page a visitor navigates to deliberately in order to
  book — not on any landing page. `/book` is not in the Lighthouse URL list, so
  the perf budget is unaffected; that is a fact about the current config rather
  than a guarantee, and adding `/book` to `.lighthouserc.json` would need this
  revisited.
- Two colour params are derived from `lib/brand-colors` rather than pasted, so
  the widget cannot drift from the palette.

## Alternatives rejected

**Keeping Cal.com and creating the account.** Genuinely less work — the code
already existed and supported locales. Rejected because the owner asked for
Calendly; the vendor choice belongs to them, and both integrate with Google
Calendar equally well.

**`react-calendly`.** A thin wrapper over the same script. See the dependency
reasoning above.

**Calendly's dashboard redirect instead of postMessage.** Fewer lines, but it
puts a piece of the flow somewhere the repo cannot see, verify, or restore.
