import React from "react";

import { layoutVariants } from "../layout/layout";
import { Slot } from "@radix-ui/react-slot";
import { parseSizeProps } from "../helpers/parse-props";
import { tv, VariantProps } from "tailwind-variants";
import { shadowVariants } from "../layout/shadow";
import { decorationVariants } from "../layout/decoration";

const baseBoxVariants = tv({
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
    ...rest
  } = parseSizeProps(props);

  const Comp = asChild ? Slot : TAG;

  return (
    <Comp
      style={style}
      className={boxVariants({
        className,
        p,
        px,
        py,
        shadow,
        border,
      })}
      {...rest}
      ref={forwardedRef}
    />
  );
});

Box.displayName = "Box";

export { Box, boxVariants };
export type { BoxProps };
