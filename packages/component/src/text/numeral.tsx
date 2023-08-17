import { FC, useMemo } from "react";
import { cn } from "@/utils/css";
import { commify, getDecimalLength } from "@orderly/utils";
import { NumeralWithConfig } from "./numeralWithConfig";

export type NumeralRule = "percentages" | "price" | "text";

export interface NumeralProps {
  rule?: NumeralRule;

  /**
   * 小数点后保留位数，默认4位
   * @default 4
   */

  precision?: number;
  /**
   * 小数点后保留位截段取整方式，可选 ceil, floor, round，作用与 Math.ceil、Math.floor、Math.round 对齐,默认floor
   */
  truncate?: "ceil" | "floor" | "round";

  /**
   * 需要格式化的数字
   */
  children: number | string;

  className?: string;
}

const Numeral: FC<NumeralProps> = (props) => {
  const { rule = "price", precision = 2, truncate = false } = props;

  const num = Number(props.children);
  if (Number.isNaN(num)) {
    throw new Error(
      `Numeral: children must be a number, but got ${props.children}`
    );
  }

  const child = useMemo(() => {
    if (rule === "percentages") {
      return `${(num * 100).toFixed(2)}%`;
    }

    const truncatedNum = num.toFixed(getDecimalLength(precision));

    if (rule === "price") {
      return commify(truncatedNum);
    }
    return truncatedNum;
  }, [num, precision]);

  return <span className={cn(props.className)}>{child}</span>;
};

export type CombinedComponent = typeof Numeral & {
  /**
   * 需要搭配 @orderly/hooks 使用
   */
  symbol: typeof NumeralWithConfig;
};

const CombinedComponent = Numeral as CombinedComponent;
CombinedComponent.symbol = NumeralWithConfig;

// (Numeral as CombinedComponent).symbol = NumeralWithConfig;

export { CombinedComponent as Numeral };
