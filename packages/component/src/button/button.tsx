import React, {
  useMemo,
  type ButtonHTMLAttributes,
  type FC,
  type PropsWithChildren,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/css";
import { Spinner } from "@/spinner";

const buttonVariants = cva(
  [
    "orderly-rounded orderly-transition-colors orderly-min-w-[60px] orderly-align-middle orderly-inline-flex orderly-items-center orderly-justify-center orderly-gap-1",
  ],
  {
    variants: {
      /**
       * @default contained
       */
      variant: {
        text: "orderly-text-slate-500 hover:orderly-bg-slate-100",
        outlined:
          "orderly-text-slate-500 orderly-bg-transparent orderly-border orderly-border-slate-500 hover:orderly-bg-slate-100",
        contained:
          "orderly-text-white orderly-bg-slate-500 hover:orderly-bg-slate-600 orderly-shadow-button",
        gradient:
          "orderly-bg-gradient-to-r orderly-from-slate-100 orderly-to-slate-600",
      },
      /**
       * @default default
       */
      size: {
        small: "orderly-px-3 orderly-h-[26px] orderly-text-3xs",
        default: "orderly-px-4 orderly-py-1 orderly-h-[40px]",
        large: "orderly-px-6 orderly-py-3",
      },
      color: {
        primary:
          "orderly-text-primary hover:orderly-bg-primary hover:orderly-text-white active:orderly-bg-primary/90",
        secondary:
          "orderly-text-secondary orderly-bg-secondary hover:orderly-bg-secondary hover:orderly-text-white active:orderly-bg-secondary/90",
        tertiary: "orderly-bg-tertiary",
        success:
          "orderly-text-success orderly-bg-transparent hover:orderly-bg-success hover:orderly-text-white active:orderly-bg-success/90",
        buy: "orderly-text-white orderly-bg-trade-profit hover:orderly-bg-trade-profit/90 active:orderly-bg-trade-profit/90",
        sell: "orderly-text-white orderly-bg-trade-loss hover:orderly-bg-trade-loss/90 active:orderly-bg-trade-loss/90",
        danger:
          "orderly-text-danger orderly-bg-danger hover:orderly-bg-danger/90 active:orderly-bg-danger/90",
      },
      // evlevation: {
      //
      // },
      fullWidth: {
        true: "orderly-w-full",
      },
      disabled: {
        true: "orderly-opacity-50 orderly-cursor-not-allowed",
      },
    },
    compoundVariants: [
      {
        variant: "text",
        color: "primary",
        class:
          "orderly-text-primary orderly-bg-transparent hover:orderly-bg-slate-100 hover:orderly-text-primary",
      },

      {
        variant: "contained",
        color: "primary",
        class:
          "orderly-bg-primary hover:orderly-bg-primary/90 orderly-text-base-contrast",
      },
      {
        variant: "contained",
        color: "primary",
        disabled: true,
        class:
          "orderly-bg-base-400 hover:orderly-bg-base-400 orderly-text-base-contrast/15",
      },
      {
        variant: "contained",
        color: "secondary",
        class:
          "orderly-bg-secondary orderly-text-base-contrast hover:orderly-bg-secondary/90",
      },
      {
        variant: "contained",
        color: "tertiary",
        class:
          "orderly-bg-base-400 hover:orderly-bg-base-400 orderly-text-base-contrast",
      },
      {
        variant: "contained",
        color: "danger",
        class:
          "orderly-bg-danger orderly-text-base-contrast hover:orderly-bg-danger/90",
      },
      {
        variant: "outlined",
        color: "primary",
        class:
          "orderly-text-primary orderly-bg-transparent orderly-border orderly-border-primary-darken hover:orderly-bg-primary/10",
      },
      {
        variant: "outlined",
        color: "buy",
        class:
          "orderly-text-trade-profit orderly-bg-transparent orderly-border orderly-border-trade-profit hover:orderly-bg-trade-profit/10 hover:orderly-text-trade-profit",
      },
      {
        variant: "outlined",
        color: "tertiary",
        class:
          "orderly-text-base-contrast-54 orderly-bg-transparent orderly-border orderly-border-base-contrast-36 hover:orderly-bg-tertiary/10 hover:orderly-text-tertiary",
      },

      {
        variant: "outlined",
        color: "sell",
        class:
          "orderly-text-trade-loss orderly-bg-transparent orderly-border orderly-border-trade-loss hover:orderly-bg-trade-loss/10 hover:orderly-text-white",
      },
      {
        variant: "text",
        color: "primary",
        class:
          "orderly-text-primary orderly-bg-transparent hover:orderly-text-primary hover:orderly-bg-primary/10",
      },
    ],
    defaultVariants: {
      variant: "contained",
      color: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled" | "color">,
    VariantProps<typeof buttonVariants> {
  /**
   * If `true`, the button will show a loading indicator.
   * @default false
   */
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: FC<PropsWithChildren<ButtonProps>> = ({
  className,
  size,
  color,
  variant,
  fullWidth,
  disabled,
  loading,
  leftIcon,
  rightIcon,
  ...props
}) => {
  const children = useMemo(() => {
    if (!!loading) {
      return (
        <>
          <Spinner size={"small"} className="orderly-mr-[4px]" />
          {props.children}
        </>
      );
    }
    return props.children;
  }, [props.children, loading]);
  return (
    <button
      className={cn(
        buttonVariants({
          size,
          variant,
          color,
          disabled,
          fullWidth,
        }),
        className,
        `button button-${variant} button-${color} button-${size} button-${fullWidth} button-${disabled}`
      )}
      disabled={Boolean(disabled)}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
};

Button.displayName = "Button";

export { Button, buttonVariants };
