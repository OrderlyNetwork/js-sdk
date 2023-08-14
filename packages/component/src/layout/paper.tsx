import { cn } from "@/utils/css";
import { Slot } from "@radix-ui/react-slot";
import { VariantProps, cva } from "class-variance-authority";
import { FC, HTMLAttributes, PropsWithChildren } from "react";

const paperVariants = cva(["rounded p-3"], {
  variants: {
    variant: {
      outline: "border border-slate-500 ",
      contained: "bg-white",
    },
    square: {
      true: "rounded-none",
    },
  },
  defaultVariants: {
    variant: "contained",
  },
});

export interface PaperProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof paperVariants> {
  asChild?: boolean;
}

const Paper: FC<PropsWithChildren<PaperProps>> = (props) => {
  const { asChild, className, variant, square, ...rest } = props;
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      className={cn(paperVariants({ variant, square, className }))}
      {...rest}
    />
  );
};

export { Paper, paperVariants };
