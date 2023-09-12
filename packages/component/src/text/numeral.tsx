import React, { FC, useMemo } from "react";
import { cn } from "@/utils/css";
import {
  commify,
  getPrecisionByNumber,
  numberToHumanStyle,
} from "@orderly.network/utils";
import { NumeralWithSymbol } from "./numeralWithSymbol";
import { NumeralTotal } from "@/text/numeralTotal";
import { Decimal } from "@orderly.network/utils";

export type NumeralRule = "percentages" | "price" | "human";

export interface NumeralProps {
  rule?: NumeralRule;

  /**
   * 小数点后保留位数，默认4位
   * @default 4
   */

  precision?: number;

  tick?: number;
  /**
   * 小数点后保留位截段取整方式，可选 ceil, floor, round，作用与 Math.ceil、Math.floor、Math.round 对齐,默认floor
   */
  truncate?: "ceil" | "floor" | "round";

  /**
   * 需要格式化的数字
   */
  children: number | string;

  className?: string;

  coloring?: boolean;

  loading?: boolean;

  surfix?: React.ReactNode;
  prefix?: React.ReactNode;
}

const coloringClasses: Record<string, string> = {
  lose: "text-trade-loss",
  profit: "text-trade-profit",
  neutral: "text-base-contrast/50",
};

export const Numeral: FC<NumeralProps> = (props) => {
  const {
    rule = "price",
    coloring,
    precision,
    tick,
    surfix,
    prefix,
    truncate = false,
  } = props;
  // TODO: check precision

  const num = Number(props.children);

  const child = useMemo(() => {
    if (Number.isNaN(num)) {
      return "--";
    }

    // console.log("!!!!!!!!!!!!!!!!!!!", num, props.precision);

    if (rule === "human") {
      return numberToHumanStyle(num);
    }

    const d = new Decimal(num);
    if (rule === "percentages") {
      return `${d.mul(100).toFixed(2)}%`;
    }

    const dp =
      typeof precision !== "undefined"
        ? precision
        : tick
        ? getPrecisionByNumber(tick)
        : 2;

    let truncatedNum = d.toFixed(dp);

    if (rule === "price") {
      return commify(truncatedNum);
    }
    return truncatedNum;
  }, [num, precision]);

  const colorClassName = useMemo(() => {
    if (!coloring) return "";

    // if (props.value === 0) return coloringClasses.neutral;

    const num = Number(props.children);

    if (Number.isNaN(num)) {
      // console.warn(`if coloring, value is need number: ${props.value}`);
      return "";
    }

    if (num === 0) return coloringClasses.neutral;
    if (num < 0) return coloringClasses.lose;

    return coloringClasses.profit;
  }, [coloring, props.children]);

  const childWithUnit = useMemo(() => {
    if (typeof surfix === "undefined" && typeof prefix === "undefined")
      return child;
    // return `${child} ${unit}`;
    return (
      <span className="flex gap-1">
        {prefix}
        {child}
        {surfix}
      </span>
    );
  }, [child, surfix]);

  return (
    <span className={cn(colorClassName, props.className)}>{childWithUnit}</span>
  );
};
