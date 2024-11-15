import React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "..";

const switchVariants = tv({
  slots: {
    root: [
      "peer",
      "oui-inline-flex",
      "oui-h-[16px]",
      "oui-w-[28px]",
      "oui-shrink-0",
      "oui-cursor-pointer",
      "oui-items-center",
      "oui-rounded-full",
      // "oui-border-3",
      "oui-border-transparent",
      "oui-shadow-sm",
      "oui-transition-colors",
      "focus-visible:oui-outline-none",
      "focus-visible:oui-ring-2",
      "focus-visible:oui-ring-ring",
      "focus-visible:oui-ring-offset-2",
      "focus-visible:oui-ring-offset-background",
      "disabled:oui-cursor-not-allowed",
      "disabled:oui-opacity-50",
      "data-[state=checked]:oui-bg-primary-darken",
      "data-[state=unchecked]:oui-bg-input",
    ],
    thumb: [
      "oui-pointer-events-none",
      "oui-block",
      "oui-h-[10px]",
      "oui-w-[10px]",
      "oui-rounded-full",
      "oui-bg-white/80",
      "oui-shadow-lg",
      "oui-ring-0",
      "oui-transition-transform",
      "data-[state=checked]:oui-translate-x-[15px]",
      "data-[state=unchecked]:oui-translate-x-[3px]",
    ],
  },
  variants: {
    color: {
      primary: {
        root: [
          "data-[state=checked]:oui-bg-primary-darken",
          "data-[state=unchecked]:oui-bg-base-1",
        ],
      },
      success: {
        root: [
          "data-[state=checked]:oui-bg-success",
          "data-[state=unchecked]:oui-bg-success",
        ],
      },
      danger: {
        root: [
          "data-[state=checked]:oui-bg-danger",
          "data-[state=unchecked]:oui-bg-danger",
        ],
      },
      warning: {
        root: [
          "data-[state=checked]:oui-bg-warning-darken",
          "data-[state=unchecked]:oui-bg-warning-darken",
        ],
      },
    },
  },
  defaultVariants: {
    color: "primary",
  },
});

interface SwitchProps
  extends VariantProps<typeof switchVariants>,
    Omit<
      React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
      "color"
    > {}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, color, ...props }, ref) => {
  const { root, thumb } = switchVariants({
    className,
    color,
  });

  return (
    <SwitchPrimitives.Root className={root({ className })} {...props} ref={ref}>
      <SwitchPrimitives.Thumb className={thumb()} />
    </SwitchPrimitives.Root>
  );
});
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
