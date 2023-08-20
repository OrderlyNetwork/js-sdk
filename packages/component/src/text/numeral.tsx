import { FC, useMemo } from "react";
import { cn } from "@/utils/css";
import { commify, getDecimalLength } from "@orderly/utils";
import { NumeralWithConfig } from "./numeralWithConfig";
import { NumeralTotal } from "@/text/numeralTotal";

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

  coloring?: boolean;
}

const Numeral: FC<NumeralProps> = (props) => {
  const { rule = "price", coloring, precision, truncate = false } = props;
  // TODO: check precision

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

    const truncatedNum = num.toFixed(
      precision ? getDecimalLength(precision) : 2
    );

    if (rule === "price") {
      return commify(truncatedNum);
    }
    return truncatedNum;
  }, [num, precision]);

  const colorClassName = useMemo(() => {
    if (!props.coloring) return "";

    // if (props.value === 0) return coloringClasses.neutral;

    const num = Number(props.children);

    if (Number.isNaN(num)) {
      // console.warn(`if coloring, value is need number: ${props.value}`);
      return "";
    }

    if (num === 0) return coloringClasses.neutral;
    if (num < 0) return coloringClasses.lose;

    // const firstChar = String(props.value).charAt(0);
    // if (firstChar === "-") return coloringClasses.lose;
    return coloringClasses.profit;
  }, [props.coloring, props.children]);

  return <span className={cn(props.className)}>{child}</span>;
};

export type CombinedComponent = typeof Numeral & {
  /**
   * 需要搭配 @orderly/hooks 使用
   */
  symbol: typeof NumeralWithConfig;
  total: typeof NumeralTotal;
};

const CombinedComponent = Numeral as CombinedComponent;
CombinedComponent.symbol = NumeralWithConfig;
CombinedComponent.total = NumeralTotal;

// (Numeral as CombinedComponent).symbol = NumeralWithConfig;

export { CombinedComponent as Numeral };
