import { cn } from "@/utils/css";
import { FC } from "react";
import { convertValueToPercentage } from "./utils";

export interface SliderTipProps {
  value?: number[];
  className?: string;
  min: number;
  max: number;
}

export const SliderTip: FC<SliderTipProps> = (props) => {
  const { className, min, max } = props;
  const value = props.value?.[0] ?? 0;
  const percent = convertValueToPercentage(value, min, max);
  return (
    <span
      className={cn(
        "orderly-absolute orderly-hidden orderly-rounded orderly-drop-shadow orderly-w-[36px] orderly-h-[19px] orderly-translate-x-[-12px] orderly-top-[-28px] orderly-font-semibold orderly-text-center group-focus:orderly-inline-block orderly-text-4xs after:orderly-block after:orderly-absolute after:orderly-bottom-[-8px] after:orderly-w-0 after:orderly-h-0 after:orderly-border-4 after:orderly-left-1/2 after:orderly-translate-x-[-50%] after:orderly-border-solid after:orderly-border-transparent after:orderly-border-t-inherit orderly-text-base-100",
        className
      )}
      style={{ lineHeight: "19px" }}
    >
      {`${percent.toFixed()}%`}
    </span>
  );
};
