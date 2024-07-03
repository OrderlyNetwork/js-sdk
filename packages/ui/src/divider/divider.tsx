import { tv } from "../utils/tv";
import React from "react";
import { VariantProps } from "tailwind-variants";

const dividerVariants = tv({
  base: ["oui-pointer-events-none oui-box-content"],
  variants: {
    intensity: {
      4: "oui-border-line-4",
      6: "oui-border-line-6",
      8: "oui-border-line",
      12: "oui-border-line-12",
      16: "oui-border-line-16",
    },
    direction: {
      horizontal: ["oui-border-b"],
      vertical: ["oui-border-l"],
    },
    lineStyle: {
      // solid: "oui-border-solid",
      dashed: "oui-border-dashed",
      dotted: "oui-border-dotted",
    },
  },
  defaultVariants: {
    direction: "horizontal",
    intensity: 4,
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
