import { FC, ReactNode, useMemo } from "react";
import { cn } from "@/utils/css";

export interface StatisticProps {
  label: string | ReactNode;
  value: string | number | ReactNode;

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

    const firstChar = String(props.value).charAt(0);
    if (firstChar === "-") return coloringClasses.lose;
    return coloringClasses.profit;
  }, [props.coloring, props.value]);

  const valueElement = useMemo(() => {
    if (typeof props.value === "string" || typeof props.value === "number") {
      return <span>{props.value}</span>;
    }
    return props.value;
  }, [props.value]);

  return (
    <div className={cn(props.className, alignClasses[align])}>
      <div>{labelElement}</div>
      <div className={colorClassName}>{valueElement}</div>
    </div>
  );
};
