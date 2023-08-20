import { cn } from "@/utils/css";
import React, { useMemo } from "react";
import { FC, useEffect, useLayoutEffect, useRef } from "react";
import {
  convertValueToPercentage,
  getThumbInBoundsOffset,
} from "@/slider/utils";

export type SliderMark = {
  value: number;
  label: string;
  position?: number;
};

export interface SliderMarksProps {
  value: number[];
  marks?: SliderMark[];
  color: "primary" | "buy" | "sell";
  // width: number;
  min: number;
  max: number;
}

export const SliderMarks: FC<SliderMarksProps> = (props) => {
  const { marks, value } = props;

  // const spanRef = useRef<HTMLSpanElement | null>(null);

  return (
    <>
      {marks?.map((mark, index) => {
        const percent = convertValueToPercentage(
          mark.value,
          props.min,
          props.max
        );
        const thumbInBoundsOffset = getThumbInBoundsOffset(6, percent, 1);

        return (
          <span
            key={index}
            className={cn(
              "absolute top-0 w-[6px] h-[6px] rounded-[6px] border border-fill-light bg-fill pointer-events-none translate-x-[-50%]",
              {
                "border-primary bg-primary":
                  props.color === "primary" && value[0] >= mark.value,
                "border-trade-profit bg-trade-profit":
                  props.color === "buy" && value[0] >= mark.value,
                "border-trade-loss bg-trade-loss":
                  props.color === "sell" && value[0] >= mark.value,
              }
            )}
            style={{
              left: `calc(${percent}% + ${thumbInBoundsOffset}px)`,
              top: "7px",
            }}
          />
        );
      })}
    </>
  );
};
