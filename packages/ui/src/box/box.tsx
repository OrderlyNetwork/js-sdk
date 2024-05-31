import React from "react";

import { layoutVariants } from "../layout/layout";
import { Slot } from "@radix-ui/react-slot";
import { parseSizeProps } from "../helpers/parse-props";
import { VariantProps } from "tailwind-variants";
import { shadowVariants } from "../layout/shadow";
import { decorationVariants } from "../layout/decoration";
import { tv } from "../utils/tv";
import { positionVariants } from "../layout/position";
import { visibleVariants } from "../layout/visible";

export const baseBoxVariants = tv({
  base: ["oui-box"],
  variants: {
    ...layoutVariants.variants,
    ...shadowVariants.variants,
    ...decorationVariants.variants,
    ...positionVariants.variants,
    ...visibleVariants.variants,
    __position: {
      true: "oui-position",
    },
    __size: {
      true: "oui-size",
    },
  },
  defaultVariants: {
    __position: false,
    __size: false,
  },
});

const boxVariants = tv({
  extend: baseBoxVariants,
});

type BoxElement = React.ElementRef<"div">;

interface BoxProps
  extends React.ButtonHTMLAttributes<HTMLDivElement | HTMLSpanElement>,
    Omit<VariantProps<typeof boxVariants>, "__position" | "__size"> {
  asChild?: boolean;
  as?:
    | "div"
    | "span"
    | "nav"
    | "section"
    | "article"
    | "aside"
    | "header"
    | "footer";
  width?: string | number;
  height?: string | number;
  left?: string | number;
  right?: string | number;
  top?: string | number;
  bottom?: string | number;
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
    invisible,
    position,
    ...rest
  } = parseSizeProps(props);

  const Comp = asChild ? Slot : TAG;

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
        position,
        invisible,
        __position: typeof position !== "undefined",
        __size:
          typeof props.width !== "undefined" ||
          typeof props.height !== "undefined",
      })}
      {...rest}
      ref={forwardedRef}
    />
  );
});

Box.displayName = "Box";

export { Box, boxVariants };
export type { BoxProps };
