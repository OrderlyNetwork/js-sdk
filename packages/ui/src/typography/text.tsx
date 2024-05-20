import { ComponentPropsWithout, RemovedProps } from "@/helpers/component-props";
import { Slot } from "@radix-ui/react-slot";
import React from "react";
import { tv, type VariantProps } from "tailwind-variants";

const textVariants = tv({
  variants: {
    size: {
      "3xs": ["oui-text-3xs"],
      "2xs": ["oui-text-2xs"],
      xs: ["oui-text-xs"],
      sm: ["oui-text-sm"],
      base: ["oui-text-base"],
      lg: ["oui-text-lg"],
      xl: ["oui-text-xl"],
      "2xl": ["oui-text-2xl"],
      "3xl": ["oui-text-3xl"],
      "4xl": ["oui-text-4xl"],
      "5xl": ["oui-text-5xl"],
      "6xl": ["oui-text-6xl"],
    },
    weight: {
      regular: ["oui-font-normal"],
      demi: ["oui-font-semibold"],
      bold: ["oui-font-bold"],
    },
    color: {
      inherit: "oui-text-inherit",
      neutral: "oui-text-base-contrast-54",
      primary: "oui-text-primary",
      secondary: "oui-text-secondary",
      tertiary: "oui-text-tertiary",
      // quaternary: "oui-text-gray-300",
      warning: "oui-text-warning",
      danger: "oui-text-danger",
      success: "oui-text-success",
      buy: "oui-text-trade-profit",
      sell: "oui-text-trade-loss",
      lose: "oui-text-trade-loss",
      profit: "oui-text-trade-profit",
    },
  },

  defaultVariants: {
    // size: "base",
    weight: "regular",
  },
});

export type TextElement = React.ElementRef<"span">;
interface CommonTextProps extends VariantProps<typeof textVariants> {
  asChild?: boolean;
  /**
   * If true, the text will be copied when clicked.
   * TODO: implement copy
   */
  copyable?: boolean;
}
type TextSpanProps = { as?: "span" } & ComponentPropsWithout<
  "span",
  RemovedProps
>;
type TextDivProps = { as: "div" } & ComponentPropsWithout<"div", RemovedProps>;
type TextLabelProps = { as: "label" } & ComponentPropsWithout<
  "label",
  RemovedProps
>;
type TextPProps = { as: "p" } & ComponentPropsWithout<"p", RemovedProps>;
type TextProps = CommonTextProps &
  (TextSpanProps | TextDivProps | TextLabelProps | TextPProps);

const Text = React.forwardRef<TextElement, TextProps>((props, forwardedRef) => {
  const {
    children,
    className,
    asChild,
    as: Tag = "span",
    color,
    size,
    weight,
    ...textProps
  } = props;
  return (
    <Slot
      data-accent-color={color}
      {...textProps}
      ref={forwardedRef}
      className={textVariants({
        className,
        color,
        size,
        weight,
      })}
    >
      {asChild ? children : <Tag>{children}</Tag>}
    </Slot>
  );
});
Text.displayName = "Text";

export { Text, textVariants };
export type { TextProps };
