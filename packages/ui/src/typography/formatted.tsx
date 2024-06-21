import React, { useMemo } from "react";

import { format as formatDate, isValid } from "date-fns";
import { Text, TextElement, TextProps } from "./text";
import { CopyIcon } from "../icon/copy";

export type TextRule = "date" | "address" | "symbol" | "status" | "txId";

export const isTextRule = (rule: string): rule is TextRule => {
  return ["date", "address", "symbol", "status", "txId"].includes(rule);
};

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

type TxIDText = {
  rule: "txId";
  range?: [number, number];
};

type SymbolText = {
  rule: "symbol";
  // symbolElement?: "base" | "quote";
  /**
   * symbol format string, like "type-base-quote",
   * @default base-quote
   */
  formatString?: string;
  showIcon?: boolean;
};

const DEFAULT_SYMBOL_FORMAT = "base-quote";
const DEFAULT_DATE_FORMAT = "yyyy-MM-dd HH:mm:ss";

export type FormattedTextProps = TextProps & {
  // asChildren?: boolean;
  // rule?: Omit<TextRule, "status"|'address'|'date'>;
  loading?: boolean;

  suffix?: React.ReactElement;
  prefix?: React.ReactElement;
} & (BaseText | DateText | AddressText | SymbolText | TxIDText);

export const FormattedText = React.forwardRef<TextElement, FormattedTextProps>(
  (props, ref) => {
    const {
      rule,
      children,

      prefix,
      // @ts-ignore
      symbolElement,
      // @ts-ignore
      formatString,
      // @ts-ignore
      range,
      // @ts-ignore
      capitalize,
      copyable,
      //@ts-ignore
      isIcon,
      ...rest
    } = props;
    // const Comp = asChildren ? Slot : "span";

    const suffix = useMemo(() => {
      if (typeof props.suffix !== "undefined") return props.suffix;

      if (copyable) {
        return (
          <button
            className="oui-cursor-pointer oui-text-sm"
            onClick={() => {
              navigator.clipboard.writeText(children as string);
            }}
          >
            <CopyIcon size={12} color="white" />
          </button>
        );
      }
    }, [props.suffix, copyable]);

    const content = useMemo(() => {
      if (typeof children === "undefined") return "--";
      if (typeof rule === "undefined") return children;
      if (rule === "address" || rule === "txId") {
        const address = children as string;
        const [start, end] = range ?? (rule === "address" ? [6, 4] : [6, 6]);
        const reg = new RegExp(`^(.{${start}})(.*)(.{${end}})$`);
        return `${address.replace(reg, "$1...$3")}`;
      }
      if (rule === "date") {
        // return new Date(children as string).toLocaleString();
        const date = new Date(children as string | number | Date);
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
      if (typeof suffix === "undefined" && typeof prefix === "undefined")
        return content;
      return (
        <span className="oui-flex oui-gap-1 oui-items-center">
          {prefix}
          {content}
          {suffix}
        </span>
      );
    }, [content, suffix]);

    return <Text {...rest} ref={ref} children={contentWithSurfix} />;
  }
);