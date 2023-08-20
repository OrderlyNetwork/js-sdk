"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/utils/css";
import { VariantProps, cva } from "class-variance-authority";

const switchVariants = cva("", {
  variants: {
    color: {
      primary:
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-fill-light",
      profit:
        "data-[state=checked]:bg-trade-profit data-[state=unchecked]:bg-fill-light",
      loss: "data-[state=checked]:bg-trade-loss data-[state=unchecked]:bg-fill-light",
    },
  },
  defaultVariants: {
    color: "primary",
  },
});

interface SwitchProps
  extends Omit<
      React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
      "color"
    >,
    VariantProps<typeof switchVariants> {}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, color, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-[14px] w-[32px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ",
      switchVariants({ color, className })
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-[10px] w-[10px] rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
