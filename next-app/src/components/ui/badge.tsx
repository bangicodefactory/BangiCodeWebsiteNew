import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    "inline-flex items-center rounded-sm border px-2 py-0.5",
    "font-mono text-xs font-medium uppercase tracking-widest",
    "transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "border-transparent bg-muted text-foreground",
        primary: "border-transparent bg-primary text-primary-foreground",
        /*
         * secondary-container (sky-600), NOT secondary (sky-500). White on
         * sky-500 is 3.47:1 — below the 4.5:1 AA threshold for the small text
         * a badge uses. Lighthouse caught this on the case-study pages, where
         * the practice badge is the only thing using this variant. sky-600
         * clears it at 4.96:1 and is visually near-identical.
         */
        secondary:
          "border-transparent bg-secondary-container text-on-secondary-container",
        outline: "border-border text-foreground",
        destructive: "border-transparent bg-destructive/15 text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = ({ className, variant, ...props }: BadgeProps) => (
  <div className={cn(badgeVariants({ variant }), className)} {...props} />
);

export { Badge, badgeVariants };
