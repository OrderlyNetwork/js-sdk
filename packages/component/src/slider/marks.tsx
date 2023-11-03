import { cn } from "@/utils/css";
import React, { Fragment, useMemo } from "react";
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
  value?: number[];
  marks?: SliderMark[];
  color: "primary" | "buy" | "sell" | "primary-light";
  // width: number;
  min: number;
  max: number;

  disabled?: boolean;
  markLabelVisible?: boolean;
}

export const SliderMarks: FC<SliderMarksProps> = (props) => {
  const { marks, value, markLabelVisible } = props;

  // const spanRef = useRef<HTMLSpanElement | null>(null);

  const _value = useMemo(() => value?.[0] ?? 0, [value]);
  const _max = useMemo(() => (props.max === 0 ? 1 : props.max), [props.max]);

  return (
    <>
      {marks?.map((mark, index) => {
        const percent = convertValueToPercentage(index, props.min, _max);

        const thumbInBoundsOffset = getThumbInBoundsOffset(6, percent, 1);

        return (
          <Fragment key={index}>
            <span
              className={cn(
                "absolute top-[7px] w-[6px] h-[6px] rounded-[6px] border border-fill-light bg-fill pointer-events-none translate-x-[-50%]",
                {
                  "border-primary bg-primary":
                    props.color === "primary" &&
                    _value >= mark.value &&
                    _value > 0,
                  "border-primary-light bg-primary-light":
                    props.color === "primary-light" &&
                    _value >= mark.value &&
                    _value > 0,
                  "border-trade-profit bg-trade-profit":
                    props.color === "buy" && _value >= mark.value && _value > 0,
                  "border-trade-loss bg-trade-loss":
                    props.color === "sell" &&
                    _value >= mark.value &&
                    _value > 0,
                }
              )}
              style={{
                left: `calc(${percent}% + ${thumbInBoundsOffset}px)`,
                // top: "7px",
              }}
            />
            {markLabelVisible && (
              <span
                key={index}
                className={cn(
                  "absolute top-[20px] text-sm text-base-contrast/50 pointer-events-none translate-x-[-50%]"
                )}
                style={{
                  left: `calc(${percent}% + ${thumbInBoundsOffset}px)`,
                }}
              >
                {mark.label}
              </span>
            )}
          </Fragment>
        );
      })}
    </>
  );
};
