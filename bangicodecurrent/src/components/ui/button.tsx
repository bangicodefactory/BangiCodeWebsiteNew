import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Bangicode Button
 *
 * Tokens and behaviour come from src/styles/tokens.css — see
 * docs/adr/0001-adopt-claude-design-system-tokens.md.
 *
 *   - spark:     filled brand red. The attention CTA — nav "Contact", hero
 *                primary. Used sparingly; see the ~5% red rule.
 *   - primary:   filled navy. The structural default.
 *   - secondary: 1px sky outline with sky text.
 *   - outline:   1px hairline with foreground text — quiet tertiary action
 *                ("All solutions", "View all projects").
 *   - ghost / link / destructive as before.
 *
 * Radius is `rounded-sm`, which tokens.css defines as 10px (buttons & inputs);
 * `shape="pill"` swaps it for the fully-rounded marketing CTA — see the note on
 * the variant for when each one is right.
 *
 * Motion follows the design system: hover darkens one step and lifts, press
 * settles back down and shrinks to 0.96 (opt out with `static`). Focus is the
 * global 3px sky ring, never removed.
 *
 * Sentence case labels.
 */
const buttonVariants = cva(
  // Base — applies to every variant
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-sm text-sm font-medium",
    /*
     * transition-interactive, not a hand-written property list — see the note
     * in globals.css. The old list named `transform`, which Tailwind v4 does
     * not emit for these utilities, so the lift and press snapped while the
     * colour faded.
     *
     * Duration and easing are set HERE rather than by the utility: a utility
     * that sets duration silently beats any `duration-*` a caller writes
     * beside it, which is a trap the utility itself would be laying.
     */
    "transition-interactive duration-200 ease-out",
    /*
     * The press is faster than the hover. `active:duration-[120ms]` applies
     * only while the pointer is down — verified in a browser, since the
     * `:active` variant has to out-specify the base duration to work at all.
     * A press easing in over 200ms feels laggy: the finger is up before the
     * button finishes acknowledging it.
     *
     * 0.96, not 0.98. A previous pass left this at 0.98 on the grounds that
     * retuning the distance was a design decision rather than part of that bug
     * fix, which was right at the time. This IS that design decision: 0.98 is a
     * 2% travel that on a 40px control is under one pixel of edge movement, so
     * the press registers as a colour change with a hint of blur rather than as
     * something being pushed. 0.96 is the floor where it reads as tactile
     * without reading as a toy — below 0.95 it starts to look exaggerated.
     *
     * The scale itself is NOT here — it moved to `pressScale` below so a caller
     * can opt out with `static`. The 1px settle stays, because a button that
     * only sinks and does not shrink still reads as pressed.
     */
    "active:translate-y-px active:duration-[120ms]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        /*
         * The filled variants lift AND deepen their shadow together. Moving a
         * button up without growing its shadow reads as a glitch, because the
         * light source implies the shadow should follow — the two changes are
         * one gesture, not two.
         */
        spark:
          "bg-spark text-spark-foreground shadow-spark hover:bg-spark-hover hover:-translate-y-px hover:shadow-lg",
        primary:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary-container hover:-translate-y-px hover:shadow-md",
        secondary:
          "border border-secondary text-accent hover:bg-secondary hover:text-secondary-foreground",
        outline:
          "border border-border text-foreground hover:border-secondary hover:text-accent",
        ghost: "text-foreground hover:bg-muted hover:text-foreground",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-error-container hover:text-on-error-container",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
      /*
       * `pill` is the marketing CTA shape — the fully-rounded button that reads
       * as Apple, and the one radius CLAUDE.md already lists in the system
       * ("pills 9999px") alongside the 10px it gives buttons.
       *
       * It is a variant rather than the new default on purpose. The default
       * 10px is what makes a button sit correctly NEXT TO AN INPUT, which is
       * also 10px — the contact form, the CMS editors and every admin screen
       * depend on that pairing, and a pill submit beside a 10px field looks
       * like two design systems met. So: pill on the marketing surface, system
       * radius wherever a button shares a row with a field.
       *
       * Declared after `size` so cva emits `rounded-full` after the base
       * `rounded-sm`, which is what lets tailwind-merge drop the base one.
       */
      shape: {
        default: "",
        pill: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      shape: "default",
    },
  },
);

/*
 * Not every button should shrink. A destructive confirm, or a control the user
 * is holding while something else on screen is moving, is better off still —
 * hence the `static` escape hatch rather than baking this into the base.
 */
const pressScale = "active:scale-[0.96]";

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Drop the press-scale. For controls where shrinking would distract. */
  static?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      shape,
      asChild = false,
      static: isStatic = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, shape }),
          !isStatic && pressScale,
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
