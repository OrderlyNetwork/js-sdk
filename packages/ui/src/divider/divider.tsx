import { tv } from "../utils/tv";
import React from "react";
import { VariantProps } from "tailwind-variants";

const dividerVariants = tv({
  base: [],
  variants: {
    highlight: {
      1: "oui-border-line-4",
      2: "oui-border-line-6",
      3: "oui-border-line",
      4: "oui-border-line-12",
      5: "oui-border-line-16",
    },
    direction: {
      horizontal: ["oui-w-full", "oui-border-b"],
      vertical: ["oui-h-full", "oui-border-l"],
    },
  },
  defaultVariants: {
    direction: "horizontal",
    highlight: 1,
  },
});

type DividerProps = VariantProps<typeof dividerVariants> &
  React.HTMLAttributes<HTMLDivElement>;

const Divider = React.forwardRef<HTMLDivElement, DividerProps>((props, ref) => {
  const { className, highlight, direction, ...rest } = props;
  return (
    <div
      ref={ref}
      {...rest}
      className={dividerVariants({
        direction,
        highlight,
        className,
      })}
    />
  );
});

Divider.displayName = "Divider";

export { Divider, dividerVariants };
export type { DividerProps };
