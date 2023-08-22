import { FC, HTMLAttributes, PropsWithChildren, useMemo } from "react";
import { cva, VariantProps } from "class-variance-authority";
import { TradingPair } from "./tradingPair";
import { cn } from "@/utils/css";
import { Slot } from "@radix-ui/react-slot";

const textVariants = cva([], {
  variants: {
    variant: {},
    type: {
      primary: "text-primary",
      secondary: "text-secondary",
      tertiary: "text-tertiary",
      quaternary: "text-gray-300",
      warning: "text-warning",
      danger: "text-danger",
      success: "text-success",
      buy: "text-trade-profit",
      sell: "text-trade-loss",
    },
  },
});

export type TextRule = "date" | "address" | "text" | "symbol";

export interface TextProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof textVariants> {
  asChildren?: boolean;
  rule?: TextRule;
  // if rule is address, show str range
  range?: [number, number];
  loading?: boolean;
}
export const Text: FC<PropsWithChildren<TextProps>> = (props) => {
  const { variant, rule, asChildren, type, className, children, ...rest } =
    props;
  const Comp = asChildren ? Slot : "span";

  const content = useMemo(() => {
    if (typeof children === "undefined") return "--";
    if (typeof rule === "undefined" || rule === "text") return children;
    if (rule === "address") {
      const address = children as string;
      const [start, end] = props.range ?? [6, 4];
      const reg = new RegExp(`^(.{${start}})(.*)(.{${end}})$`);
      return `${address.replace(reg, "$1...$3")}`;
    }
    if (rule === "date") return new Date(children as string).toLocaleString();
    if (rule === "symbol") {
      const arr = (children as string).split("_");
      return `${arr[1]}-${arr[0]}`;
    }

    return children;
  }, [children, rule]);

  return (
    <Comp
      {...rest}
      className={cn(textVariants({ variant, type, className }))}
      children={content}
    />
  );
};
