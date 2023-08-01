import { FC, useMemo } from "react";
import { cx } from "class-variance-authority";
import { mergeClassNames } from "@/utils/css";

export interface StatisticProps {
  label: string;
  value: string;
  percent?: number;
  coloring?: boolean;
  className?: string;
  align?: "left" | "right" | "center";

  // FormattedPrice
  as?: "price" | "date";
}

const alignClasses: Record<string, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

const coloringClasses: Record<string, string> = {
  lose: "text-red-500",
  profit: "text-green-500",
  neutral: "text-slate-500",
};

export const Statistic: FC<StatisticProps> = (props) => {
  const { align = "left" } = props;
  // 给Value添加颜色
  // lose, profit, neutral

  const colorClassName = useMemo(() => {
    if (typeof props.coloring === "undefined") return "";

    // get the first string from the value
    const firstChar = props.value[0];
    if (firstChar === "-") {
      return coloringClasses.lose;
    } else {
      return coloringClasses.profit;
    }
  }, [props.coloring, props.value]);

  return (
    <div className={mergeClassNames(props.className, alignClasses[align])}>
      <div>{props.label}</div>
      <div className={colorClassName}>
        <span>{props.value}</span>
        {typeof props.percent !== "undefined" && <span>{props.percent}</span>}
      </div>
    </div>
  );
};
