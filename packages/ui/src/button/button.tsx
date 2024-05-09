import React, { PropsWithChildren } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { BaseButton, BaseButtonProps } from "./base";
import { shadowVariants } from "../layout/shadow";

const buttonVariants = tv({
  base: [
    "oui-button",
    "oui-inline-flex",
    "oui-items-center",
    "oui-justify-center",
    "oui-whitespace-nowrap",
    "oui-transition-colors",
    "disabled:oui-cursor-not-allowed",
  ],
  variants: {
    ...shadowVariants.variants,
    variant: {
      // text: "oui-bg-transparent",
      outlined: "oui-border",
      contained: "oui-text-white",
      gradient: "oui-bg-gradient-to-r oui-from-slate-100 oui-to-slate-600",
    },
    size: {
      xs: ["oui-px-1", "oui-rounded", "oui-h-6", "oui-text-2xs"],
      sm: ["oui-px-3", "oui-rounded", "oui-h-7", "oui-text-2xs"],
      md: ["oui-px-3", "oui-rounded-md", "oui-h-8", , "oui-text-sm"],
      default: ["oui-px-3", "oui-rounded-md", "oui-h-10", "oui-text-base"],
      lg: ["oui-px-4", "oui-rounded-lg", "oui-h-13", "oui-text-lg"],
    },
    color: {
      primary: ["hover:oui-bg-primary/70"],
      success: [],
      danger: [],
      warning: [],
      gray: [],
      darkGray: [],
    },
    fullWidth: {
      true: "oui-w-full",
    },
    disabled: {
      true: "",
    },
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
    {
      variant: "contained",
      color: "darkGray",
      className: ["oui-bg-base-4", "oui-text-danger-contrast"],
    },
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
    {
      variant: "outlined",
      color: "darkGray",
      className: ["oui-border-base-4", "oui-text-base"],
    },
    {
      variant: "contained",
      disabled: true,
      className: ["oui-bg-base-3", "oui-text-base-contrast"],
    },
  ],
  defaultVariants: {
    size: "default",
    variant: "contained",
    color: "primary",
    // elevation: "none",
  },
});

interface ButtonProps
  extends Omit<BaseButtonProps, "size">,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<
  HTMLButtonElement,
  PropsWithChildren<ButtonProps>
>(({ className, variant, size, color, fullWidth, shadow, ...props }, ref) => {
  // const Comp = asChild ? Slot : "button";
  return (
    <BaseButton
      className={buttonVariants({
        variant,
        size,
        color,
        className,
        disabled: props.disabled,
        fullWidth,
        shadow,
      })}
      size={size}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };

export type { ButtonProps };
