import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { tv, cnBase, VariantProps } from "tailwind-variants";
import { CheckIcon } from "../icon/check";

const checkboxVariants = tv({
  base: [
    "peer",
    "oui-h-3",
    "oui-w-3",
    "oui-shrink-0",
    "oui-rounded-sm",
    "oui-border",
    // "oui-border-primary",
    "focus-visible:oui-outline-none",
    // "focus-visible:oui-ring-1",
    // "focus-visible:oui-ring-ring",
    "disabled:oui-cursor-not-allowed",
    "disabled:oui-opacity-50",
    // "data-[state=checked]:oui-bg-primary",
    // "data-[state=checked]:oui-text-base-contrast",
  ],
  variants: {
    color: {
      blue: "oui-border-primary data-[state=checked]:oui-bg-primary data-[state=checked]:oui-text-base-contrast",
      white:
        "oui-border-base-contrast-54 data-[state=checked]:oui-bg-white/80 data-[state=checked]:oui-text-[rgba(0,0,0,0.88)]",
    },
    variant: {
      // checkBox: [],
      checkBox: "",
      radio:
        "oui-rounded-full data-[state=checked]:oui-border-base-contrast-20 data-[state=checked]:oui-bg-transparent",
    },
  },
  defaultVariants: {
    color: "blue",
    // style: "checkBox",
  },
});

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    size?: number;
    indicatorClassName?: string;
    color?: "blue" | "white";
    variant?: "checkBox" | "radio";
  }
>(({ className, color = "blue", variant = "checkBox", ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={checkboxVariants({ color, className, variant })}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cnBase(
        "oui-flex oui-items-center oui-justify-center oui-text-current",
        props.indicatorClassName
      )}
    >
      {variant === "checkBox" ? (
        <CheckIcon
          size={props.size ?? 12}
          opacity={color === "blue" ? 0.54 : 1}
          color={color === "blue" ? "white" : "black"}
        />
      ) : (
        <div
          className={cnBase(
            "oui-w-[6px] oui-h-[6px] oui-rounded-full",
            "oui-bg-base-contrast-80"
          )}
        />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
