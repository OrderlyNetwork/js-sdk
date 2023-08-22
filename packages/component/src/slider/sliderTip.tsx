import { cn } from "@/utils/css";
import { FC } from "react";
import { convertValueToPercentage } from "./utils";

export interface SliderTipProps {
  value: number[];
  className?: string;
  min: number;
  max: number;
}

export const SliderTip: FC<SliderTipProps> = (props) => {
  const { className, min, max } = props;
  const value = props.value[0] ?? 0;
  const percent = convertValueToPercentage(value, min, max);
  return (
    <span
      className={cn(
        "absolute hidden rounded drop-shadow w-[36px] h-[19px] translate-x-[-12px] top-[-28px] font-semibold text-center group-focus:inline-block text-xs after:block after:absolute after:bottom-[-8px] after:w-0 after:h-0 after:border-4 after:left-1/2 after:translate-x-[-50%] after:border-solid after:border-transparent after:border-t-inherit text-base-100",
        className
      )}
      style={{ lineHeight: "19px" }}
    >
      {`${percent.toFixed()}%`}
    </span>
  );
};
