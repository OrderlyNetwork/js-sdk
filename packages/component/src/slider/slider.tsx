"use client";

import React, { useMemo } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/utils/css";
import { SliderMark, SliderMarks } from "./marks";
import { SliderTip } from "./sliderTip";

// import { useSize } from "@radix-ui/react-use-size";

export type SliderColor = "primary" | "primary-light" | "buy" | "sell";

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  color: SliderColor;
  marks?: SliderMark[];
  markCount?: number;
  markLabelVisible?: boolean;
  showTip?: boolean;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(
  (
    {
      className,
      marks,
      markCount,
      markLabelVisible,
      color = "primary",
      showTip = true,
      onValueChange,
      ...props
    },
    ref
  ) => {
    const { min = 0, max = 100, step, value = 0 } = props;

    // const spanRef = useRef<HTMLSpanElement | null>(null);

    // const size = useSize(spanRef.current);

    const innerMasks = useMemo(() => {
      let _max = max;
      if (_max === 0) {
        _max = 1;
      }

      if (Array.isArray(marks) && marks.length > 0) {
        return marks;
      }

      if (typeof markCount !== "undefined") {
        const marks: SliderMark[] = [];

        // if(max === 0){

        // }

        const piece = _max / markCount;
        const len = markCount - 1;

        for (let i = 0; i <= len; i++) {
          const value = i * piece;
          marks.push({
            value,
            label: `${value}`,
          });
        }

        marks.push({
          value: _max,
          label: `100`,
        });

        return marks;
      }
    }, [marks, markCount, max]);

    //

    const onValueChangeInner = (value: number[]) => {
      onValueChange?.(value);
    };

    const bgClassName = useMemo(() => {
      return cn(
        {
          "bg-primary border-primary": color === "primary",
          "bg-primary-light border-primary-light": color === "primary-light",
          "bg-trade-profit border-trade-profit": color === "buy",
          "bg-trade-loss border-trade-loss": color === "sell",
        },
        props.disabled && "bg-fill-light"
      );
    }, [color, props.disabled]);

    return (
      <div className={cn("relative")}>
        <SliderPrimitive.Root
          ref={ref}
          className={cn(
            "relative flex items-center select-none touch-none w-full h-[20px] ",
            className
          )}
          onValueChange={onValueChangeInner}
          {...props}
        >
          <SliderPrimitive.Track className="bg-fill-light relative grow rounded-full h-[2px] z-0">
            <SliderPrimitive.Range
              className={cn(
                "absolute bg-fill-light rounded-full h-full",
                bgClassName
              )}
            />
          </SliderPrimitive.Track>

          {Array.isArray(innerMasks) && innerMasks.length > 0 && (
            <SliderMarks
              value={props.value}
              color={color}
              marks={innerMasks}
              min={min}
              max={max}
              markLabelVisible={markLabelVisible}
            />
          )}
          <SliderPrimitive.Thumb
            className={cn(
              "block w-[10px] h-[10px] bg-fill border-[2px] border-fill-light rounded-[10px] focus:outline-none focus:w-[16px] focus:h-[16px] focus:shadow-[0_0_0_8px] focus:shadow-base-contrast/20 z-20 disabled:pointer-events-none group",
              {
                "border-primary": color === "primary",
                "border-primary-light": color === "primary-light",
                "border-trade-profit": color === "buy",
                "border-trade-loss": color === "sell",
              },
              props.disabled && "border-transparent bg-fill-light"
            )}
            aria-label="Volume"
          >
            {showTip && (
              <SliderTip
                value={props.value}
                className={bgClassName}
                max={max}
                min={0}
              />
            )}
          </SliderPrimitive.Thumb>
        </SliderPrimitive.Root>
      </div>
    );
  }
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
