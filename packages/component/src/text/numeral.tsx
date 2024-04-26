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
import { Minus, Plus } from "lucide-react";

export type NumeralRule = "percentages" | "price" | "human";

export interface NumeralProps {
  rule?: NumeralRule;

  /**
   * Decimal point reserved digits, default 2 digits
   * @default 2
   */

  precision?: number;

  tick?: number;
  /**
   * The method of rounding the decimal digits after the decimal point, options are ceil, floor, round, aligns with Math.ceil, Math.floor, Math.round.
   * @default floor
   */
  truncate?: "ceil" | "floor" | "round";

  /**
   * The number to be formatted
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
   * Whether to display as *****
   */
  visible?: boolean;
  /**
   * Whether to pad with 0
   * @default true
   */
  padding?: boolean;

  /**
   *
   */
  showIcon?: boolean;

  icons?: {
    loss?: React.ReactNode;
    profit?: React.ReactNode;
  };
}

const coloringClasses: Record<string, string> = {
  lose: "orderly-text-trade-loss",
  profit: "orderly-text-trade-profit",
  neutral: "orderly-text-base-contrast-54",
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
    showIcon = false,
  } = props;
  // TODO: check precision

  const num = Number(props.children);

  const child = useMemo(() => {
    if (isNaN(num)) return "--";

    if (typeof visible !== "undefined" && !visible) return "*****";

    return parseNumber(num, {
      rule,
      precision,
      tick,
      truncate,
      padding,
      abs: showIcon,
    });
  }, [num, precision, visible, showIcon]);

  const colorClassName = useMemo(() => {
    if (!coloring) return "";
    if (typeof visible !== "undefined" && !visible) return "";

    // if (props.value === 0) return coloringClasses.neutral;

    if (Number.isNaN(num)) {
      // console.warn(`if coloring, value is need number: ${props.value}`);
      return "";
    }

    if (num === 0) return coloringClasses.neutral;
    if (num < 0) return coloringClasses.lose;

    return coloringClasses.profit;
  }, [coloring, num, props.visible]);

  const icon = useMemo(() => {
    if (!showIcon || Number.isNaN(num) || num === 0) return null;
    if (typeof visible !== "undefined" && !visible) return null;

    if (num < 0) {
      if (props.icons?.loss) return props.icons?.loss;
      // @ts-ignore
      return <Minus size={12} />;
    }

    if (props.icons?.profit) return props.icons?.profit;
    // @ts-ignore
    return <Plus size={12} />;
  }, [num, props.visible, showIcon]);

  const childWithUnit = useMemo(() => {
    if (
      typeof surfix === "undefined" &&
      typeof prefix === "undefined" &&
      typeof unit === "undefined" &&
      typeof cureency === "undefined" &&
      !showIcon
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
      <>
        {prefixEle}
        {child}
        {surfixEle}
      </>
    );
  }, [child, surfix, unit, prefix]);

  if (!colorClassName && !props.className) {
    return <>{childWithUnit}</>;
  }

  return (
    <span
      className={cn(
        "orderly-inline-flex orderly-items-center orderly-gap-1 orderly-tabular-nums",
        colorClassName,
        props.className
      )}
    >
      {icon}
      {childWithUnit}
    </span>
  );
};
