import { cn } from "@/utils/css";
import { VariantProps, cva } from "class-variance-authority";
import { FC, PropsWithChildren } from "react";

const tagVariants = cva(["orderly-rounded-[4px]", "orderly-px-2", "orderly-text-4xs", "orderly-inline-block"], {
  variants: {
    size: {
      small: "orderly-h-[16px]",
      default: "orderly-h-[18px]",
    },
    color: {
      primary: "orderly-bg-primary/25 orderly-text-primary-light",
      //   secondary: "bg-secondary text-white",
      // success: "bg-success text-white",
      // danger: "bg-danger text-white",
      // warning: "bg-warning text-white",
      // info: "bg-info text-white",
      buy: "orderly-bg-trade-profit/[.15] orderly-text-trade-profit",
      sell: "orderly-bg-trade-loss/[.15] orderly-text-trade-loss",
    },
  },
  defaultVariants: {
    size: "default",
    color: "primary",
  },
});

export interface TagProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "size" | "color">,
    VariantProps<typeof tagVariants> {}

export const Tag: FC<PropsWithChildren<TagProps>> = ({
  className,
  size,
  color,
  children,
  ...props
}) => {
  return (
    <div
      {...props}
      className={cn(
        tagVariants({
          size,
          color,
          // disabled,
        }),
        className
      )}
    >
      {children}
    </div>
  );
};
