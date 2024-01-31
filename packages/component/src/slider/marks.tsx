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
  isInnerMask?: boolean;
}

export const SliderMarks: FC<SliderMarksProps> = (props) => {
  const { marks, value, markLabelVisible, isInnerMask } = props;

  // const spanRef = useRef<HTMLSpanElement | null>(null);

  const _value = useMemo(() => value?.[0] ?? 0, [value]);
  const _max = useMemo(() => (props.max === 0 ? 1 : props.max), [props.max]);

  return (
    <>
      {marks?.map((mark, index) => {
        // const percent = convertValueToPercentage(mark.value, props.min, _max);
        const percent = convertValueToPercentage(index, 0, marks.length - 1);

        const thumbInBoundsOffset = getThumbInBoundsOffset(6, percent, 1);
        const __value = isInnerMask ? mark.value : index;

        return (
          <Fragment key={index}>
            <span
              className={cn(
                "orderly-absolute orderly-top-[7px] orderly-w-[6px] orderly-h-[6px] orderly-rounded orderly-border orderly-border-base-200 orderly-bg-base-800 orderly-pointer-events-none orderly-translate-x-[-50%]",
                {
                  "orderly-border-primary orderly-bg-primary":
                    props.color === "primary" &&
                    _value >= __value &&
                    _value > 0 &&
                    !props.disabled,
                  "orderly-border-primary-light orderly-bg-primary-light":
                    props.color === "primary-light" &&
                    _value >= __value &&
                    _value > 0 &&
                    !props.disabled,
                  "orderly-border-trade-profit orderly-bg-trade-profit":
                    props.color === "buy" &&
                    _value >= __value &&
                    _value > 0 &&
                    !props.disabled,
                  "orderly-border-trade-loss orderly-bg-trade-loss":
                    props.color === "sell" &&
                    _value >= __value &&
                    _value > 0 &&
                    !props.disabled,
                }
              )}
              style={{
                left: `calc(${percent}% + ${thumbInBoundsOffset}px)`,
                // top: "7px",
              }}
            />
            {!props.disabled && markLabelVisible && (
              <span
                key={index}
                className={cn(
                  "orderly-absolute orderly-top-[20px] orderly-text-2xs orderly-text-base-contrast/50 orderly-pointer-events-none orderly-translate-x-[-50%] desktop:orderly-text-xs"
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
