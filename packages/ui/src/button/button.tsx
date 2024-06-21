import React, { PropsWithChildren } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { BaseButton, BaseButtonProps } from "./base";
import { shadowVariants } from "../layout/shadow";
import { parseAngleProps } from "../helpers/parse-props";

const buttonVariants = tv({
  base: [
    "oui-button",
    "oui-inline-flex",
    "oui-items-center",
    "oui-justify-center",
    "oui-whitespace-nowrap",
    "oui-transition-colors",
    "disabled:oui-cursor-not-allowed",
    "disabled:oui-bg-base-3",
    "disabled:oui-text-base-contrast-36",
    "disabled:hover:oui-bg-base-3",
  ],
  variants: {
    ...shadowVariants.variants,
    variant: {
      text: "oui-bg-transparent",
      outlined: "oui-border",
      contained: "oui-text-white",
      gradient: "oui-gradient-brand",
    },
    size: {
      xs: ["oui-px-1", "oui-rounded", "oui-h-6", "oui-text-2xs"], //24px
      sm: ["oui-px-3", "oui-rounded", "oui-h-7", "oui-text-2xs"], //28px
      md: ["oui-px-3", "oui-rounded-md", "oui-h-8", , "oui-text-sm"], //32px
      lg: ["oui-px-3", "oui-rounded-md", "oui-h-10", "oui-text-base"], //40px
      xl: ["oui-px-4", "oui-rounded-lg", "oui-h-13", "oui-text-lg"], //54px
    },
    color: {
      primary: ["hover:oui-bg-primary/70 active:oui-bg-primary/50"],
      secondary: "hover:oui-bg-base-4/70 active:oui-bg-base-4/50",
      success: "hover:oui-bg-success/70 active:oui-bg-success/50",
      danger: "hover:oui-bg-danger/70 active:oui-bg-danger/50",
      warning: "hover:oui-bg-warning/70 active:oui-bg-warning/50",
      gray: "hover:oui-bg-base-2/70 active:oui-bg-base-2/50",
    },
    fullWidth: {
      true: "oui-w-full",
    },
    // disabled: {
    //   true: "oui-bg-base-3 oui-text-base-contrast-36",
    // },
  },
  compoundVariants: [
    // contained
    {
      variant: "contained",
      color: "primary",
      className: ["oui-bg-primary", "oui-text-primary-contrast"],
    },
    {
      variant: "contained",
      color: "secondary",
      className: ["oui-bg-base-4", "oui-text-primary-contrast"],
    },
    {
      variant: "contained",
      color: "success",
      className: ["oui-bg-success", "oui-text-success-contrast"],
    },
    {
      variant: "contained",
      color: "warning",
      className: ["oui-bg-warning", "oui-text-warning-contrast"],
    },
    {
      variant: "contained",
      color: "danger",
      className: ["oui-bg-danger", "oui-text-danger-contrast"],
    },
    {
      variant: "contained",
      color: "gray",
      className: ["oui-bg-base-2", "oui-text-base-contrast"],
    },

    // contained end
    // {
    //   variant: "contained",
    //   color: "darkGray",
    //   className: ["oui-bg-base-4", "oui-text-danger-contrast"],
    // },
    // outlined
    {
      variant: "outlined",
      color: "primary",
      className: ["oui-border-primary", "oui-text-primary"],
    },
    {
      variant: "outlined",
      color: "success",
      className: ["oui-border-success", "oui-text-success"],
    },
    {
      variant: "outlined",
      color: "warning",
      className: ["oui-border-warning", "oui-text-warning"],
    },
    {
      variant: "outlined",
      color: "danger",
      className: ["oui-border-danger", "oui-text-danger"],
    },
    {
      variant: "outlined",
      color: "gray",
      className: ["oui-border-base-2", "oui-text-base"],
    },
    // outlined end
    // {
    //   variant: "outlined",
    //   color: "darkGray",
    //   className: ["oui-border-base-4", "oui-text-base"],
    // },
    // text
    {
      variant: "text",
      color: "primary",
      className: ["oui-text-primary hover:oui-bg-primary/10"],
    },
    {
      variant: "text",
      color: "success",
      className: ["oui-text-success hover:oui-bg-success/10"],
    },
    {
      variant: "text",
      color: "warning",
      className: ["oui-text-warning hover:oui-bg-warning/10"],
    },
    {
      variant: "text",
      color: "danger",
      className: ["oui-text-danger hover:oui-bg-danger/10"],
    },
    {
      variant: "text",
      color: "gray",
      className: ["oui-text-base hover:oui-bg-base-2/10"],
    },
    {
      variant: "text",
      color: "secondary",
      className: ["oui-text-base-contrast-36 hover:oui-bg-base-2/10"],
    },
  ],
  defaultVariants: {
    size: "lg",
    variant: "contained",
    color: "primary",
    // elevation: "none",
  },
});

interface ButtonProps
  extends Omit<BaseButtonProps, "size">,
    VariantProps<typeof buttonVariants> {
  angle?: number;
}

const Button = React.forwardRef<
  HTMLButtonElement,
  PropsWithChildren<ButtonProps>
>(
  (
    {
      className,
      variant,
      size,
      color,
      fullWidth,
      shadow,
      angle,
      style,
      ...props
    },
    ref
  ) => {
    // const Comp = asChild ? Slot : "button";
    const angleStyle = parseAngleProps({ angle });
    return (
      <BaseButton
        className={buttonVariants({
          variant,
          size,
          color,
          className,
          fullWidth,
          shadow,
        })}
        size={size}
        ref={ref}
        style={{ ...style, ...angleStyle }}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

export type { ButtonProps };