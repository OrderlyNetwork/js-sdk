import React from "react";

import { layoutVariants } from "../layout/layout";
import { Slot } from "@radix-ui/react-slot";
import { parseSizeProps } from "../helpers/parse-props";
import { VariantProps } from "tailwind-variants";
import { shadowVariants } from "../layout/shadow";
import { decorationVariants } from "../layout/decoration";
import { tv } from "../utils/tv";

export const baseBoxVariants = tv({
  base: ["oui-box oui-size"],
  variants: {
    ...layoutVariants.variants,
    ...shadowVariants.variants,
    ...decorationVariants.variants,
  },
});

const boxVariants = tv({
  extend: baseBoxVariants,
});

type BoxElement = React.ElementRef<"div">;

interface BoxProps
  extends React.ButtonHTMLAttributes<HTMLDivElement | HTMLSpanElement>,
    VariantProps<typeof boxVariants> {
  asChild?: boolean;
  as?: "div" | "span";
  width?: string | number;
  height?: string | number;
  /**
   * Angle of the gradient
   */
  angle?: number;
}

const Box = React.forwardRef<BoxElement, BoxProps>((props, forwardedRef) => {
  const {
    asChild = false,
    as: TAG = "div",
    className,
    p,
    px,
    py,
    style,
    shadow,
    border,
    gradient,
    r,
    ...rest
  } = parseSizeProps(props);

  const Comp = asChild ? Slot : TAG;

  console.log("????", style);

  return (
    <Comp
      style={style}
      className={boxVariants({
        className,
        p,
        r,
        px,
        py,
        shadow,
        border,
        gradient,
      })}
      {...rest}
      ref={forwardedRef}
    />
  );
});

Box.displayName = "Box";

export { Box, boxVariants };
export type { BoxProps };
