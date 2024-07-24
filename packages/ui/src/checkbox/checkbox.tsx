import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { tv, cnBase } from "tailwind-variants";
import { CheckIcon } from "../icon/check";

const checkboxVariants = tv({
  base: [
    "peer",
    "oui-h-3",
    "oui-w-3",
    "oui-shrink-0",
    "oui-rounded-sm",
    "oui-border",
    "oui-border-primary",
    "focus-visible:oui-outline-none",
    // "focus-visible:oui-ring-1",
    // "focus-visible:oui-ring-ring",
    "disabled:oui-cursor-not-allowed",
    "disabled:oui-opacity-50",
    "data-[state=checked]:oui-bg-primary",
    "data-[state=checked]:oui-text-base-contrast",
  ],
});

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    size?: number;
    indicatorClassName?: string;
  }
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={checkboxVariants({ className })}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cnBase(
        "oui-flex oui-items-center oui-justify-center oui-text-current",
        props.indicatorClassName
      )}
    >
      <CheckIcon size={12} color="white" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
