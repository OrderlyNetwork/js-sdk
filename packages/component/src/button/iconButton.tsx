import { cn } from "@/utils/css";
import { VariantProps, cva } from "class-variance-authority";
import { ButtonHTMLAttributes, FC, PropsWithChildren } from "react";

const iconButtonVariants = cva(
  ["orderly-rounded-full orderly-flex orderly-items-center orderly-justify-center"],
  {
    variants: {
      variant: {
        outlined: "",
        default: "orderly-bg-black/10 hover:orderly-bg-black/20",
      },
      size: {
        small: "orderly-px-2 orderly-h-[28px] orderly-w-[28px]",
        default: "orderly-px-2 orderly-py-1 orderly-h-[40px] orderly-w-[40px]",
        large: "orderly-px-6 orderly-py-3",
      },
      color: {
        primary: "orderly-text-primary",
        tertiary: "orderly-text-tertiary",
      },
      disabled: {
        true: "orderly-opacity-50 orderly-cursor-not-allowed",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled" | "color">,
    VariantProps<typeof iconButtonVariants> {
  /**
   * If `true`, the button will show a loading indicator.
   * @default false
   */
  loading?: boolean;
}

const IconButton: FC<PropsWithChildren<ButtonProps>> = ({
  className,
  size,
  color,
  variant,
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(
        iconButtonVariants({
          size,
          variant,
          color,
          disabled,
          className,
        })
      )}
      {...props}
    />
  );
};

IconButton.displayName = "IconButton";

export { IconButton, iconButtonVariants };
