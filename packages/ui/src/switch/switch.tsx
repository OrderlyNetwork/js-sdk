import React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { tv, type VariantProps } from "tailwind-variants";

const switchVariants = tv({
  slots: {
    root: [
      "peer",
      "oui-inline-flex",
      "oui-h-5",
      "oui-w-9",
      "oui-shrink-0",
      "oui-cursor-pointer",
      "oui-items-center",
      "oui-rounded-full",
      "oui-border-2",
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
      "data-[state=checked]:oui-bg-primary",
      "data-[state=unchecked]:oui-bg-input",
    ],
    thumb: [
      "oui-pointer-events-none",
      "oui-block",
      "oui-h-4",
      "oui-w-4",
      "oui-rounded-full",
      "oui-bg-white/60",
      "oui-shadow-lg",
      "oui-ring-0",
      "oui-transition-transform",
      "data-[state=checked]:oui-translate-x-4",
      "data-[state=unchecked]:oui-translate-x-0",
    ],
  },
  variants: {
    color: {
      primary: {
        root: [
          "data-[state=checked]:oui-bg-primary",
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
          "data-[state=checked]:oui-bg-warning",
          "data-[state=unchecked]:oui-bg-warning",
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
    <SwitchPrimitives.Root className={root()} {...props} ref={ref}>
      <SwitchPrimitives.Thumb className={thumb()} />
    </SwitchPrimitives.Root>
  );
});
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
