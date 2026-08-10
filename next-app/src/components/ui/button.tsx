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
 * Radius is `rounded-sm`, which tokens.css defines as 10px (buttons & inputs).
 * Motion follows the design system: hover darkens one step and lifts, press
 * settles back down. Focus is the global 3px sky ring, never removed.
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
     * The 0.98 scale and 1px settle are unchanged — this fixes WHETHER they
     * animate, not how far they travel. Retuning the distances is a design
     * decision and does not belong in a bug fix.
     */
    "active:translate-y-px active:scale-[0.98] active:duration-[120ms]",
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
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
