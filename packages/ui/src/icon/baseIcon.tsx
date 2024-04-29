import { ComponentPropsWithout, RemovedProps } from "@/helpers/component-props";
import React from "react";
import { type VariantProps, tv } from "tailwind-variants";

const iconVariants = tv({
  variants: {
    color: {
      primary: "oui-text-primary",
      success: "oui-text-success",
      danger: "oui-text-danger",
      warning: "oui-text-warning",
      //   secondary: "oui-text-secondary",
      //   tertiary: "oui-text-tertiary",
      white: "oui-text-white",
      black: "oui-text-black",
      //   gray: "oui-text-gray",
      //   darkGray: "oui-text-darkGray",
    },
  },
  defaultVariants: {
    color: "primary",
  },
});

export interface BaseIconProps
  extends ComponentPropsWithout<"svg", RemovedProps>,
    VariantProps<typeof iconVariants> {
  width?: number;
  height?: number;
  opacity?: number;
}

export const BaseIcon = React.forwardRef<SVGSVGElement, BaseIconProps>(
  (props, ref) => {
    const { width = 24, height = 24, color, className, ...rest } = props;
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        fill="none"
        viewBox="0 0 24 24"
        ref={ref}
        className={iconVariants({ className, color })}
        {...rest}
      />
    );
  }
);
