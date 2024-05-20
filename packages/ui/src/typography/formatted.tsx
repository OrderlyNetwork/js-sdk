import React, { useMemo } from "react";

import { format as formatDate, isValid } from "date-fns";
import { TextProps, Text, TextElement } from "./text";

export type TextRule = "date" | "address" | "symbol" | "status";

type DateText = {
  rule: "date";
  /**
   * use date-fns to format the date, default is "YYYY-MM-DD HH:mm:ss", more info:
   * @see https://date-fns.org/v3.6.0/docs/format
   */
  formatString?: string;
};
type AddressText = {
  rule: "address";
  /**
   * range of the address to show
   * the first number is the length of the start of the address, and the second number is the length of the end of the address
   * @default [6, 4]
   */
  range?: [number, number];
};

type BaseText = {
  rule: Omit<TextRule, "address" | "date">;
  /**
   * capitalize the first letter of the string
   */
  capitalize?: boolean;
};

type SymbolText = {
  rule: "symbol";
  // symbolElement?: "base" | "quote";
  /**
   * symbol format string, like "type-base-quote",
   * @default base-quote
   */
  formatString?: string;
};

const DEFAULT_SYMBOL_FORMAT = "base-quote";
const DEFAULT_DATE_FORMAT = "yyyy-MM-dd HH:mm:ss";

export type FormattedTextProps = TextProps & {
  // asChildren?: boolean;
  // rule?: Omit<TextRule, "status"|'address'|'date'>;
  loading?: boolean;

  surfix?: React.ReactNode;
  prefix?: React.ReactNode;
} & (BaseText | DateText | AddressText | SymbolText);

export const FormattedText = React.forwardRef<TextElement, FormattedTextProps>(
  (props, ref) => {
    const {
      rule,
      children,
      surfix,
      prefix,
      // @ts-ignore
      symbolElement,
      // @ts-ignore
      formatString,
      // @ts-ignore
      range,
      // @ts-ignore
      capitalize,
      ...rest
    } = props;
    // const Comp = asChildren ? Slot : "span";

    const content = useMemo(() => {
      if (typeof children === "undefined") return "--";
      if (typeof rule === "undefined") return children;
      if (rule === "address") {
        const address = children as string;
        const [start, end] = range ?? [6, 4];
        const reg = new RegExp(`^(.{${start}})(.*)(.{${end}})$`);
        return `${address.replace(reg, "$1...$3")}`;
      }
      if (rule === "date") {
        // return new Date(children as string).toLocaleString();
        const date = new Date((children as string).trim());
        if (!isValid(date)) {
          return "Error: Invalid Date";
        }
        return formatDate(
          new Date(children as string),
          formatString ?? DEFAULT_DATE_FORMAT
        );
      }
      /**
       * format Orderly symbol
       */
      if (rule === "symbol") {
        const arr = (children as string).split("_");
        const type = arr[0];
        const base = arr[1];
        const quote = arr[2];

        return (formatString ?? DEFAULT_SYMBOL_FORMAT)
          .replace("type", type)
          .replace("base", base)
          .replace("quote", quote);

        // if (typeof symbolElement !== "undefined") {
        //   if (symbolElement === "base") {
        //     return arr[1];
        //   }
        //   return arr[2];
        // }
        // return `${arr[1]}-${arr[0]}`;
      }

      // if (rule === "status") {
      //   const status = children as string;
      //   if (status === OrderStatus.NEW || status === OrderStatus.OPEN) {
      //     return "Pending";
      //   }
      //   const text = firstLetterToUpperCase(status);

      //   return text;
      // }

      return children;
    }, [children, rule, formatString, range, symbolElement]);

    const contentWithSurfix = useMemo(() => {
      if (typeof surfix === "undefined" && typeof prefix === "undefined")
        return content;
      return (
        <span className="oui-flex oui-gap-1">
          {prefix}
          {content}
          {surfix}
        </span>
      );
    }, [content, surfix]);

    return <Text {...rest} ref={ref} children={contentWithSurfix} />;
  }
);
