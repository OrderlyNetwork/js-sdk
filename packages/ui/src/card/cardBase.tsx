import React from "react";
import type { ComponentPropsWithout } from "../helpers/component-props";
import { cnBase, type VariantProps } from "tailwind-variants";
import { tv } from "../utils/tv";
import { decorationVariants } from "../layout/decoration";

const cardVariants = tv({
  base: [
    "oui-card-root",
    "oui-card",
    "oui-rounded-xl",
    "oui-shadow",
    "oui-text-base-contrast",
    "oui-p-6",
  ],

  variants: {
    ...decorationVariants.variants,
  },
  defaultVariants: {
    intensity: 900,
  },
});

export type BaseCardProps = ComponentPropsWithout<"div", "color"> &
  VariantProps<typeof cardVariants>;

const CardBase = React.forwardRef<HTMLDivElement, BaseCardProps>(
  ({ className, intensity, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cardVariants({ intensity, className })}
        {...props}
      />
    );
  }
);
CardBase.displayName = "CardBase";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cnBase(
      "oui-card-header oui-flex oui-flex-col oui-space-y-1.5",
      className
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cnBase(
      "oui-card-header-title oui-font-semibold oui-leading-none oui-tracking-tight oui-text-lg",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cnBase("oui-text-sm oui-text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cnBase("oui-card-content oui-py-4", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={className} {...props} />
));
CardFooter.displayName = "CardFooter";

export {
  CardBase,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
};
