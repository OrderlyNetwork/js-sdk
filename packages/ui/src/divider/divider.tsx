import { tv } from "../utils/tv";
import React from "react";
import { VariantProps } from "tailwind-variants";

const dividerVariants = tv({
  base: ["oui-pointer-events-none"],
  variants: {
    intensity: {
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
    lineStyle: {
      // solid: "oui-border-solid",
      dashed: "oui-border-dashed",
      dotted: "oui-border-dotted",
    },
  },
  defaultVariants: {
    direction: "horizontal",
    intensity: 1,
  },
});

type DividerProps = VariantProps<typeof dividerVariants> &
  React.HTMLAttributes<HTMLDivElement>;

const Divider = React.forwardRef<HTMLDivElement, DividerProps>((props, ref) => {
  const { className, intensity, direction, lineStyle, ...rest } = props;
  return (
    <div
      ref={ref}
      {...rest}
      className={dividerVariants({
        direction,
        intensity,
        className,
        lineStyle,
      })}
    />
  );
});

Divider.displayName = "Divider";

export { Divider, dividerVariants };
export type { DividerProps };
