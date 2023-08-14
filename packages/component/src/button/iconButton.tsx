import { cn } from "@/utils/css";
import { VariantProps, cva } from "class-variance-authority";
import { ButtonHTMLAttributes, FC, PropsWithChildren } from "react";

const iconButtonVariants = cva(
  ["rounded-full flex items-center justify-center"],
  {
    variants: {
      variant: {
        outlined: "",
        default: "bg-black/10 hover:bg-black/20",
      },
      size: {
        small: "px-2 h-[28px] w-[28px]",
        default: "px-2 py-1 h-[40px] w-[40px]",
        large: "px-6 py-3",
      },
      color: {
        primary: "text-primary",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed",
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
