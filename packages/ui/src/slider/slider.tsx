import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cnBase, VariantProps } from "tailwind-variants";
import { tv } from "../utils/tv";

const sliderVariants = tv({
  slots: {
    root: "oui-relative oui-flex oui-w-full oui-touch-none oui-select-none oui-items-center",
    thumb: [
      "oui-block",
      "oui-h-[10px]",
      "oui-w-[10px]",
      "oui-rounded-full",
      "oui-border-[2px]",
      "oui-border-primary-light",
      "oui-bg-base-5",
      "oui-shadow",
      "oui-transition-colors",
      "focus-visible:oui-outline-none",
      "focus-visible:oui-ring-1",
      "focus-visible:oui-ring-ring",
      "disabled:oui-pointer-events-none",
      "disabled:oui-opacity-50",
    ],
    track:
      "oui-relative oui-h-[6px] oui-w-full oui-grow oui-overflow-hidden oui-rounded-full",

    trackInner:
      "oui-absolute oui-left-0 oui-right-0 oui-h-[2px] oui-top-[2px] oui-bg-base-1",
    range: "oui-absolute oui-h-[2px] oui-top-[2px] oui-bg-primary-light",
  },
  variants: {
    color: {
      primary: {
        thumb: ["oui-border-primary-light", "oui-bg-base-5"],
        trackInner: "oui-bg-primary-light",
      },
      buy: {
        thumb: ["oui-border-success-light", "oui-bg-base-5"],
        trackInner: "oui-bg-success-light",
      },
      sell: {
        thumb: ["oui-border-danger-light", "oui-bg-base-5"],
        trackInner: "oui-bg-danger-light",
      },
    },
  },
});

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> &
    VariantProps<typeof sliderVariants> & {
      showMarks?: boolean;
      classNames?: {
        root?: string;
        thumb?: string;
        track?: string;
        range?: string;
      };
    }
>(({ className, color, classNames, ...props }, ref) => {
  const { track, range, thumb, root, trackInner } = sliderVariants({
    color,
  });

  return (
    <SliderPrimitive.Root ref={ref} className={root({ className })} {...props}>
      <SliderPrimitive.Track
        className={track({ className: classNames?.track })}
      >
        <div className={trackInner()} />
        <SliderPrimitive.Range
          className={range({ className: classNames?.range })}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={thumb({
          className: classNames?.thumb,
        })}
      />
    </SliderPrimitive.Root>
  );
});

Slider.displayName = SliderPrimitive.Root.displayName;

const Marks = (props: { step?: number; className?: string }) => {
  if (!props.step) return null;
  return Array(props.step).map((value, index) => {
    return (
      <div
        key={index}
        className="oui-absolute oui-w-[1px] oui-h-[4px] oui-bg-base-1 oui-pointer-events-none"
        style={{ left: `${value}%` }}
      ></div>
    );
  });
};

const Mark = () => {
  return <div />;
};

export { Slider };
