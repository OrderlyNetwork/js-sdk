import { FC, ReactNode, useContext, useMemo } from "react";
import { cn } from "@/utils/css";
import { Numeral } from "@/text";
import { StatisticStyleContext } from "./defaultStaticStyle";

export interface StatisticProps {
  label: string | ReactNode;
  value: string | number | ReactNode;

  coloring?: boolean;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  rule?: "percentages" | "price" | "text";
  align?: "left" | "right" | "center";

  asChild?: boolean;

  // FormattedPrice
  // as?: "price" | "date";
}

const alignClasses: Record<string, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

const coloringClasses: Record<string, string> = {
  lose: "text-trade-loss",
  profit: "text-trade-profit",
  neutral: "text-base-contrast/50",
};

export const Statistic: FC<StatisticProps> = (props) => {
  const { align = "left", rule, asChild } = props;
  const { labelClassName, valueClassName } = useContext(StatisticStyleContext);

  const labelElement = useMemo(() => {
    if (typeof props.label === "string") {
      return props.label;
    }
    return props.label;
  }, [props.label]);

  // 给Value添加颜色
  // lose, profit, neutral
  const colorClassName = useMemo(() => {
    if (!props.coloring) return "";
    if (typeof props.value !== "number" && typeof props.value !== "string")
      return "";

    // if (props.value === 0) return coloringClasses.neutral;

    const num = Number(props.value);

    if (Number.isNaN(num)) {
      // console.warn(`if coloring, value is need number: ${props.value}`);
      return "";
    }
    if (num === 0) return coloringClasses.neutral;
    if (num < 0) return coloringClasses.lose;

    // const firstChar = String(props.value).charAt(0);
    // if (firstChar === "-") return coloringClasses.lose;
    return coloringClasses.profit;
  }, [props.coloring, props.value]);

  // ---------- create value element ----------
  const valueElement = useMemo(() => {
    if (typeof props.value === "string" || typeof props.value === "number") {
      if (typeof rule !== "undefined") {
        return <Numeral rule={rule}>{props.value}</Numeral>;
      }
      return <span>{props.value}</span>;
    }
    return props.value;
  }, [props.value, rule]);

  return (
    <div className={cn(props.className, alignClasses[align])}>
      <div className={cn(labelClassName, props.labelClassName)}>
        {labelElement}
      </div>
      <div className={cn(valueClassName, props.valueClassName, colorClassName)}>
        {valueElement}
      </div>
    </div>
  );
};
