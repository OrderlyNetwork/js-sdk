import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/utils/css";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "orderly-peer orderly-h-[16px] orderly-w-[16px] orderly-shrink-0 orderly-rounded-sm orderly-border-2 orderly-border-base-contrast-54 orderly-ring-offset-base-700 focus-visible:orderly-outline-none focus-visible:orderly-ring-2 focus-visible:orderly-ring-ring focus-visible:orderly-ring-offset-2 disabled:orderly-cursor-not-allowed disabled:orderly-opacity-50 data-[state=checked]:desktop:orderly-bg-base-contrast data-[state=checked]:orderly-text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn(
        "orderly-flex orderly-items-center orderly-justify-center orderly-text-base-100"
      )}
    >
      {/*@ts-ingor*/}
      <Check size={15} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
