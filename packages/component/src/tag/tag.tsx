import { cn } from "@/utils/css";
import { VariantProps, cva } from "class-variance-authority";
import { FC, PropsWithChildren } from "react";

const tagVariants = cva(["rounded-[4px]", "px-2", "text-4xs", "inline-block"], {
  variants: {
    size: {
      small: "h-[16px]",
      default: "h-[18px]",
    },
    color: {
      primary: "bg-primary/25 text-primary-light",
      //   secondary: "bg-secondary text-white",
      // success: "bg-success text-white",
      // danger: "bg-danger text-white",
      // warning: "bg-warning text-white",
      // info: "bg-info text-white",
      buy: "bg-trade-profit/[.15] text-trade-profit",
      sell: "bg-trade-loss/[.15] text-trade-loss",
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
