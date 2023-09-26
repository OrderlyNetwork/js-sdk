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
    "rounded transition-colors min-w-[60px] align-middle inline-flex items-center justify-center gap-1",
  ],
  {
    variants: {
      /**
       * @default contained
       */
      variant: {
        text: "text-slate-500 hover:bg-slate-100",
        outlined:
          "text-slate-500 bg-transparent border border-slate-500 hover:bg-slate-100",
        contained: "text-white bg-slate-500 hover:bg-slate-600 shadow-button",
        gradient: "bg-gradient-to-r from-slate-100 to-slate-600",
      },
      /**
       * @default default
       */
      size: {
        small: "px-3 h-[26px] text-sm",
        default: "px-4 py-1 h-[40px]",
        large: "px-6 py-3",
      },
      color: {
        primary:
          "text-primary hover:bg-primary hover:text-white active:bg-primary/90",
        secondary:
          "text-secondary bg-secondary hover:bg-secondary hover:text-white active:bg-secondary/90",
        tertiary: "bg-tertiary",
        success:
          "text-success bg-transparent hover:bg-success hover:text-white active:bg-success/90",
        buy: "text-white bg-trade-profit hover:bg-trade-profit/90 active:bg-trade-profit/90",
        sell: "text-white bg-trade-loss hover:bg-trade-loss/90 active:bg-trade-loss/90",
        danger: "text-danger bg-danger hover:bg-danger/90 active:bg-danger/90",
      },
      // evlevation: {
      //
      // },
      fullWidth: {
        true: "w-full",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed",
      },
    },
    compoundVariants: [
      {
        variant: "text",
        color: "primary",
        class:
          "text-primary bg-transparent hover:bg-slate-100 hover:text-primary",
      },
      {
        variant: "contained",
        color: "primary",
        class: "bg-primary hover:bg-primary/90 text-base-contrast",
      },
      {
        variant: "contained",
        color: "secondary",
        class: "bg-secondary text-base-contrast hover:bg-secondary/90",
      },
      {
        variant: "contained",
        color: "danger",
        class: "bg-danger text-base-contrast hover:bg-danger/90",
      },
      {
        variant: "outlined",
        color: "primary",
        class:
          "text-primary bg-transparent border border-primary hover:bg-primary/10",
      },
      {
        variant: "outlined",
        color: "buy",
        class:
          "text-trade-profit bg-transparent border border-trade-profit hover:bg-trade-profit/10 hover:text-trade-profit",
      },
      {
        variant: "outlined",
        color: "tertiary",
        class:
          "text-tertiary bg-transparent border border-tertiary hover:bg-tertiary/10 hover:text-tertiary",
      },

      {
        variant: "outlined",
        color: "sell",
        class:
          "text-trade-loss bg-transparent border border-trade-loss hover:bg-trade-loss/10 hover:text-white",
      },
      {
        variant: "text",
        color: "primary",
        class:
          "text-primary bg-transparent hover:text-primary hover:bg-primary/10",
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
      return <Spinner size={"small"} />;
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
        className
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
