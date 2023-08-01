import type { ButtonHTMLAttributes, FC, PropsWithChildren } from "react";
import { cva, cx, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const buttonVariants = cva(["rounded-md transition-colors"], {
  variants: {
    /**
     * @default contained
     */
    variant: {
      text: "text-slate-500 hover:bg-slate-100",
      outlined:
        "text-slate-500 bg-transparent border border-slate-500 hover:bg-slate-100",
      contained: "text-slate-100 bg-slate-500 hover:bg-slate-600",
      gradient: "bg-gradient-to-r from-slate-100 to-slate-600",
    },
    /**
     * @default default
     */
    size: {
      small: "px-2 h-[28px]",
      default: "px-2 py-1 h-[40px]",
      large: "px-6 py-3",
    },
    fullWidth: {
      true: "w-full",
    },
    disabled: {
      true: "opacity-50 cursor-not-allowed",
    },
  },
  compoundVariants: [],
  defaultVariants: {
    variant: "contained",
    size: "default",
  },
});

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled">,
    VariantProps<typeof buttonVariants> {
  /**
   * If `true`, the button will show a loading indicator.
   * @default false
   */
  loading?: boolean;
}

const Button: FC<PropsWithChildren<ButtonProps>> = ({
  className,
  size,
  variant,
  fullWidth,
  disabled,
  ...props
}) => {
  return (
    <button
      className={twMerge(
        buttonVariants({
          size,
          variant,
          disabled,
          fullWidth,
          className,
        })
      )}
      {...props}
    />
  );
};

export { Button, buttonVariants };
