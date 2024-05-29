import React from "react";
import type { ComponentPropsWithout } from "../helpers/component-props";
import { cnBase, type VariantProps } from "tailwind-variants";
import { tv } from "../utils/tv";

const cardVariants = tv({
  base: [
    "oui-rounded-xl ",
    // oui-text-card-foreground

    "oui-shadow",
    "oui-text-base-contrast",
    "oui-p-6",
  ],
  variants: {
    color: {
      100: "oui-bg-base-1",
      200: "oui-bg-base-2",
      300: "oui-bg-base-3",
      400: "oui-bg-base-4",
      500: "oui-bg-base-5",
      600: "oui-bg-base-6",
      700: "oui-bg-base-7",
      800: "oui-bg-base-8",
      900: "oui-bg-base-9",
    },
  },
  defaultVariants: {
    color: 900,
  },
});

const CardBase = React.forwardRef<
  HTMLDivElement,
  ComponentPropsWithout<"div", "color"> & VariantProps<typeof cardVariants>
>(({ className, color, ...props }, ref) => {
  return (
    <div ref={ref} className={cardVariants({ color, className })} {...props} />
  );
});
CardBase.displayName = "CardBase";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cnBase("oui-flex oui-flex-col oui-space-y-1.5", className)}
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
      "oui-font-semibold oui-leading-none oui-tracking-tight oui-text-lg",
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
  <div ref={ref} className={cnBase("oui-py-4", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cnBase("oui-flex oui-justify-end", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  CardBase,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
