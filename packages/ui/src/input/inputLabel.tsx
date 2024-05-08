import React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { Slot } from "@radix-ui/react-slot";

const inputLabelVariants = tv({
  base: "oui-text-2xs oui-text-base-contrast-54 oui-mb-1",
});

interface InputLabelProps
  extends React.HTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof inputLabelVariants> {
  asChild?: boolean;
}

const InputLabel = React.forwardRef<HTMLLabelElement, InputLabelProps>(
  (props, ref) => {
    const { asChild = false, className, ...rest } = props;
    const Comp = asChild ? Slot : "label";
    return (
      <Comp className={inputLabelVariants({ className })} ref={ref} {...rest}>
        {props.children}
      </Comp>
    );
  }
);

InputLabel.displayName = "InputLabel";

export { InputLabel, inputLabelVariants };

export type { InputLabelProps };
