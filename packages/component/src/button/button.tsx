import type { ButtonHTMLAttributes, FC, PropsWithChildren } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/css";

const buttonVariants = cva(
  ["rounded transition-colors min-w-[60px] align-middle"],
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
        small: "px-3 h-[28px] text-sm",
        default: "px-4 py-1 h-[40px]",
        large: "px-6 py-3",
      },
      color: {
        primary: "text-primary hover:bg-primary hover:text-white",
        secondary:
          "text-secondary bg-transparent hover:bg-secondary hover:text-white",
        tertiary: "text-white bg-slate-500",
        success:
          "text-success bg-transparent hover:bg-success hover:text-white",
        buy: "text-white bg-trade-profit hover:bg-trade-profit/90",
        sell: "text-white bg-trade-loss hover:bg-trade-loss/90",
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
        class: "text-white bg-primary hover:bg-primary hover:text-white",
      },
      {
        variant: "outlined",
        color: "primary",
        class:
          "text-primary bg-transparent border border-primary hover:bg-primary/10 hover:text-primary",
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
  ...props
}) => {
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
      {...props}
    />
  );
};

Button.displayName = "Button";

export { Button, buttonVariants };
