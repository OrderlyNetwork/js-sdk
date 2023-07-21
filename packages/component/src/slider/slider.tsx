import * as SliderPrimitive from "@radix-ui/react-slider";
import type { SliderProps } from "@radix-ui/react-slider";
import React from "react";

export const Slider = React.forwardRef<any, SliderProps>(
  (props, forwardedRef) => {
    const value = props.value || props.defaultValue;

    return (
      <SliderPrimitive.Slider
        className="relative flex items-center select-none touch-none w-full h-5"
        {...props}
        ref={forwardedRef}
      >
        <SliderPrimitive.Track className="bg-slate-300 relative grow rounded-full h-[3px]">
          <SliderPrimitive.Range />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block w-5 h-5 bg-white shadow-[0_2px_10px] shadow-blackA7 rounded-[10px] hover:bg-violet3 focus:outline-none focus:shadow-[0_0_0_5px] focus:shadow-blackA8" />
        {/* {value.map((_, i) => (
          <SliderPrimitive.SliderThumb key={i} />
        ))} */}
      </SliderPrimitive.Slider>
    );
  }
);
