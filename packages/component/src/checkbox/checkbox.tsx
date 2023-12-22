import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cn } from "@/utils/css";
import { CheckIcon, UncheckIcon } from "@/icon";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "orderly-checkbox",
        "orderly-peer orderly-h-[20px] orderly-w-[20px] orderly-shrink-0 disabled:orderly-cursor-not-allowed",
        "orderly-rounded-[2px] orderly-ring-offset-base-700 focus-visible:orderly-outline-none focus-visible:orderly-ring-2 focus-visible:orderly-ring-ring focus-visible:orderly-ring-offset-2",
        // 'orderly-border-2 orderly-border-base-contrast-54 disabled:orderly-opacity-50 data-[state=checked]:desktop:orderly-bg-base-contrast data-[state=checked]:orderly-text-primary-foreground'
        className
      )}
      {...props}
    >
      {props.checked ? <CheckIcon size={20} /> : <UncheckIcon size={20} />}
      {/* <CheckboxPrimitive.Indicator
        className={cn(
          "orderly-flex orderly-items-center orderly-justify-center orderly-text-base-100 orderly-w-[20px] orderly-h-[20px]"
        )}
      >
        <CheckIcon size={20} />
      </CheckboxPrimitive.Indicator> */}
    </CheckboxPrimitive.Root>
  );
});
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
