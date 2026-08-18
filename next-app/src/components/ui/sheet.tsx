"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/*
 * ── Interruptibility ──────────────────────────────────────────────────────
 *
 * "Always animate from the presentation (current) value, never the target
 * value. Starting from the logical value causes a visible jump."
 *
 * The sheet is driven by two CSS keyframe animations swapped by `data-state`.
 * A keyframe's `from` is an absolute value, so reversing mid-flight used to
 * TELEPORT: measured, a panel interrupted at 100% jumped to 0% on the very next
 * frame and then slid out — double-tap the menu button and it flashed fully
 * open before leaving.
 *
 * The fix is to make `from` a variable and write the live value into it at the
 * instant the state flips. `onOpenChange` runs before React re-renders, so the
 * DOM still holds the in-flight animation when this reads it.
 *
 * ⚠ WHY NOT THE OBVIOUS FIXES — both were tried and both are dead ends:
 *
 *   CSS transitions instead of keyframes (which is what the rest of this
 *   codebase uses for interactive state, and what would be interruptible for
 *   free) require the element to stay mounted. Radix's Presence only defers
 *   unmount for CSS *animations* — it reads `animationName` and waits for
 *   `animationend`, and has no transition equivalent. A transition here would
 *   mean no exit animation at all.
 *
 *   `forceMount` to keep it mounted is worse. In @radix-ui/react-dialog,
 *   `DialogOverlayImpl` mounts `RemoveScroll` unconditionally, and
 *   `DialogContentModal` calls `hideOthers(content)` in a `[]`-dep effect and
 *   passes `disableOutsidePointerEvents: true`. Force-mounting therefore locks
 *   page scroll forever, marks the entire rest of the document `aria-hidden`,
 *   and sets `pointer-events: none` on the body. Verified in the installed
 *   source, not assumed.
 *
 * What this does NOT do is blend velocity across the reversal — the skill's
 * other requirement. That needs a spring, and a spring needs a library, which
 * this project deliberately does not carry (150KB JS budget per route). The
 * jump is gone; the direction change is still a curve swap rather than a
 * physical one.
 */
const SHEET_ENTER_MS = 380;
const SHEET_EXIT_MS = 240;
/* Below this a reversal is too short to read as motion and just looks like a
 * flicker, so a nearly-finished animation still gets a perceptible return. */
const SHEET_MIN_MS = 120;

function capturePresentationValues(opening: boolean) {
  /*
   * A document query rather than refs threaded through context. The sheet is
   * modal — Radix traps focus and blocks outside pointer events — so at most
   * one is ever animating, and `.sheet-surface` marks exactly the two nodes
   * (scrim and panel) that carry these animations.
   */
  for (const el of document.querySelectorAll<HTMLElement>(".sheet-surface")) {
    /*
     * SNAPSHOT FIRST, WRITE SECOND — and the order is not stylistic.
     *
     * getComputedStyle returns a LIVE declaration that recomputes on every
     * property access. The keyframes read `--sheet-from-opacity`, so writing it
     * redefines the `from` of the animation that is still running on this
     * element, which changes the element's current computed opacity, which the
     * next read of the same object then returns. Interleaving reads and writes
     * therefore feeds the function its own output.
     *
     * It did. Measured: captured at a true opacity of 0.9087, the duration came
     * out 238ms instead of 218ms, because by the time the calculation read
     * opacity back it had been dragged to 0.9917 by the write two lines above.
     * Harmless at this size and completely silent — which is the problem.
     */
    const style = getComputedStyle(el);
    const translate = style.translate;
    const opacity = style.opacity;

    if (translate !== "none") {
      const [x = "0px", y = "0px"] = translate.split(" ");
      el.style.setProperty("--sheet-from-x", x);
      el.style.setProperty("--sheet-from-y", y);
    }
    el.style.setProperty("--sheet-from-opacity", opacity);

    /*
     * Shorten the animation to the distance still to travel, or a reversal at
     * 90% open would take the full 240ms to cover the last tenth and crawl.
     * Opacity is the progress signal because both surfaces animate it, while
     * only the panel translates.
     */
    const progress = Number(opacity) || 0;
    const remaining = opening ? 1 - progress : progress;
    const full = opening ? SHEET_ENTER_MS : SHEET_EXIT_MS;
    el.style.setProperty(
      "--sheet-duration",
      `${Math.max(SHEET_MIN_MS, Math.round(full * remaining))}ms`,
    );
  }
}

function Sheet({
  onOpenChange,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>) {
  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      capturePresentationValues(open);
      onOpenChange?.(open);
    },
    [onOpenChange],
  );
  return <DialogPrimitive.Root {...props} onOpenChange={handleOpenChange} />;
}
Sheet.displayName = "Sheet";

const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    /*
     * `sheet-overlay` and `sheet-panel-*` below are hand-written keyframes in
     * globals.css, not utilities. They replace `animate-in` / `fade-in-0` /
     * `slide-in-from-*`, which come from `tailwindcss-animate` — a plugin this
     * project has never installed. Those class names compiled to nothing, so
     * the menu and its scrim appeared and disappeared in a single frame while
     * looking, in the source, like they were animated.
     */
    className={cn(
      "bg-scrim/40 sheet-surface sheet-overlay fixed inset-0 z-50",
      className,
    )}
    {...props}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const sheetVariants = cva(
  /*
   * `transition ease-in-out` went with the animate-in classes. It expanded to
   * `transition-property: …, transform, …` on an element whose only change is
   * mounting and unmounting, so it transitioned nothing and cost a style recalc
   * for the privilege — and the bare `transition` shorthand is the
   * catch-everything form this codebase avoids everywhere else.
   *
   * `sheet-panel-start` / `sheet-panel-end` name the PHYSICAL edge the panel
   * flies from, matching the physical `side` prop. site-nav already picks left
   * for Arabic and right otherwise; a logical property here would flip that a
   * second time and land the Arabic menu on the wrong edge.
   */
  "fixed z-50 flex flex-col bg-popover border-border shadow-xl",
  {
    variants: {
      side: {
        top: "sheet-surface sheet-panel-top inset-x-0 top-0 border-b",
        bottom: "sheet-surface sheet-panel-bottom inset-x-0 bottom-0 border-t",
        left: "sheet-surface sheet-panel-start inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
        right:
          "sheet-surface sheet-panel-end inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
      },
    },
    defaultVariants: { side: "right" },
  },
);

interface SheetContentProps
  extends
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      {/*
       * `end-4`, not `right-4`: on /ar the sheet opens from the left and a
       * physical right-4 put the close control on the far side of the panel
       * from where the reading eye and the thumb both start.
       *
       * size-10 because this was a bare 16px icon with no padding — a 16×16
       * hit area, under WCAG 2.2 SC 2.5.8's 24×24 floor and well under the 40px
       * a thumb actually wants. The X itself is unchanged; the box around it is
       * what grew.
       */}
      <DialogPrimitive.Close className="ring-offset-background focus:ring-ring absolute end-4 top-4 flex size-10 items-center justify-center rounded-sm opacity-70 transition-opacity duration-200 ease-out hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
      {children}
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 p-6", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-2 p-6 sm:flex-row sm:justify-end",
      className,
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "font-display text-foreground text-lg font-semibold",
      className,
    )}
    {...props}
  />
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("font-body text-muted-foreground text-sm", className)}
    {...props}
  />
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
