import React, { FC, HTMLAttributes, PropsWithChildren, useMemo } from "react";
import { cva, VariantProps } from "class-variance-authority";
import { TradingPair } from "./tradingPair";
import { cn } from "@/utils/css";
import { Slot } from "@radix-ui/react-slot";
import { dayjs } from "@orderly.network/utils";

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
  symbolElement?: "quote" | "base";
  surfix?: React.ReactNode;

  formatString?: string;
}
export const Text: FC<PropsWithChildren<TextProps>> = (props) => {
  const {
    variant,
    rule,
    asChildren,
    type,
    className,
    children,
    symbolElement,
    surfix,
    formatString,
    ...rest
  } = props;
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
    if (rule === "date") {
      // return new Date(children as string).toLocaleString();
      return dayjs(children as string).format(
        formatString ?? "YYYY-MM-DD HH:mm:ss"
      );
    }
    if (rule === "symbol") {
      const arr = (children as string).split("_");
      if (typeof symbolElement !== "undefined") {
        if (symbolElement === "base") {
          return arr[1];
        }
        return arr[2];
      }
      return `${arr[1]}-${arr[0]}`;
    }

    return children;
  }, [children, rule]);

  const contentWithSurfix = useMemo(() => {
    if (typeof surfix === "undefined") return content;
    return (
      <span className="flex gap-1">
        {content}
        {surfix}
      </span>
    );
  }, [content, surfix]);

  return (
    <Comp
      {...rest}
      className={cn(textVariants({ variant, type, className }))}
      children={contentWithSurfix}
    />
  );
};
