import React, { FC, HTMLAttributes, PropsWithChildren, useMemo } from "react";
import { cva, VariantProps } from "class-variance-authority";
import { TradingPair } from "./tradingPair";
import { cn } from "@/utils/css";
import { Slot } from "@radix-ui/react-slot";
import { dayjs } from "@orderly.network/utils";
import { firstLetterToUpperCase } from "@/utils/string";
import { OrderStatus } from "@orderly.network/types";

const textVariants = cva([], {
  variants: {
    variant: {},
    type: {
      primary: "orderly-text-primary",
      secondary: "orderly-text-secondary",
      tertiary: "orderly-text-tertiary",
      quaternary: "orderly-text-gray-300",
      warning: "orderly-text-warning",
      danger: "orderly-text-danger",
      success: "orderly-text-success",
      buy: "orderly-text-trade-profit",
      sell: "orderly-text-trade-loss",
    },
  },
});

export type TextRule = "date" | "address" | "text" | "symbol" | "status";

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

    if (rule === "status") {
      const status = children as string;
      if (status === OrderStatus.NEW || status === OrderStatus.OPEN) {
        return "Pending";
      }
      const text = firstLetterToUpperCase(status);

      return text;
    }

    return children;
  }, [children, rule]);

  const contentWithSurfix = useMemo(() => {
    if (typeof surfix === "undefined") return content;
    return (
      <span className="orderly-flex orderly-gap-1">
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
