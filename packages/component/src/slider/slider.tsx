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
          "orderly-bg-primary orderly-border-primary": color === "primary",
          "orderly-bg-primary-light orderly-border-primary-light": color === "primary-light",
          "orderly-bg-trade-profit orderly-border-trade-profit": color === "buy",
          "orderly-bg-trade-loss orderly-border-trade-loss": color === "sell",
        },
        props.disabled && "orderly-bg-fill-light",
        "orderly-text-base-600"
      );
    }, [color, props.disabled]);

    return (
      <div className={cn("orderly-relative")}>
        <SliderPrimitive.Root
          ref={ref}
          className={cn(
            "orderly-relative orderly-flex orderly-items-center orderly-select-none orderly-touch-none orderly-w-full orderly-h-[20px]",
            className
          )}
          onValueChange={onValueChangeInner}
          {...props}
        >
          <SliderPrimitive.Track className="orderly-bg-fill-light orderly-relative orderly-grow orderly-rounded-full orderly-h-[2px] orderly-z-0">
            <SliderPrimitive.Range
              className={cn(
                "orderly-absolute orderly-bg-fill-light orderly-rounded-full orderly-h-full",
                bgClassName
              )}
            />
          </SliderPrimitive.Track>

          {Array.isArray(innerMasks) && innerMasks.length > 0 && (
            <SliderMarks
              value={props.value}
              color={color}
              marks={innerMasks}
              isInnerMask={!Array.isArray(marks) || marks.length === 0}
              min={min}
              max={max}
              markLabelVisible={markLabelVisible}
            />
          )}
          <SliderPrimitive.Thumb
            className={cn(
              "orderly-block orderly-w-[10px] orderly-h-[10px] orderly-bg-fill orderly-border-[2px] orderly-border-fill-light orderly-rounded-[10px] focus:orderly-outline-none focus:orderly-w-[16px] focus:orderly-h-[16px] focus:orderly-shadow-[0_0_0_8px] focus:orderly-shadow-base-contrast/20 orderly-z-20 disabled:orderly-pointer-events-none orderly-group",
              {
                "orderly-border-primary": color === "primary",
                "orderly-border-primary-light": color === "primary-light",
                "orderly-border-trade-profit": color === "buy",
                "orderly-border-trade-loss": color === "sell",
              },
              props.disabled && "orderly-border-transparent orderly-bg-fill-light"
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
