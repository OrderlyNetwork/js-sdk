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
import { parseNumber } from "@/utils/num";

export type NumeralRule = "percentages" | "price" | "human";

export interface NumeralProps {
  rule?: NumeralRule;

  /**
   * 小数点后保留位数，默认2位
   * @default 2
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

  unit?: string;
  cureency?: string;

  /**
   * 是否显示为*****
   */
  visible?: boolean;
  /**
   * 是否需要补齐小数点后的0
   * @default true
   */
  padding?: boolean;
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
    visible,
    unit,
    cureency,
    truncate = "floor",
    padding = true,
  } = props;
  // TODO: check precision

  const num = Number(props.children);

  const child = useMemo(() => {
    if (typeof visible !== "undefined" && !visible) return "*****";

    return parseNumber(num, {
      rule,
      precision,
      tick,
      truncate,
      padding,
    });
  }, [num, precision, visible]);

  const colorClassName = useMemo(() => {
    if (!coloring) return "";
    if (typeof visible !== "undefined" && !visible) return "";

    // if (props.value === 0) return coloringClasses.neutral;

    const num = Number(props.children);

    if (Number.isNaN(num)) {
      // console.warn(`if coloring, value is need number: ${props.value}`);
      return "";
    }

    if (num === 0) return coloringClasses.neutral;
    if (num < 0) return coloringClasses.lose;

    return coloringClasses.profit;
  }, [coloring, props.children, props.visible]);

  const childWithUnit = useMemo(() => {
    if (
      typeof surfix === "undefined" &&
      typeof prefix === "undefined" &&
      typeof unit === "undefined" &&
      typeof cureency === "undefined"
    ) {
      return child;
    }

    const surfixEle = surfix ? surfix : unit ? <span>{unit}</span> : undefined;
    const prefixEle = prefix ? (
      prefix
    ) : cureency ? (
      <span>{cureency}</span>
    ) : undefined;

    return (
      <span className="flex gap-1">
        {prefixEle}
        {child}
        {surfixEle}
      </span>
    );
  }, [child, surfix, unit, prefix]);

  if (!colorClassName && !props.className) {
    return <>{childWithUnit}</>;
  }

  return (
    <span className={cn(colorClassName, props.className)}>{childWithUnit}</span>
  );
};
