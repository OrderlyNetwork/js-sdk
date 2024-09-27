import React, { FC } from "react";
import { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {}

export const SwitchMarginModuleTopIcon: FC<IconProps> = (props) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x="1.33331"
        y="2.66669"
        width="13.3333"
        height="4"
        rx="2"
        fill="currentColor"
      />
      <rect
        x="3"
        y="9"
        width="10"
        height="4"
        rx="1"
        fill="white"
        fillOpacity="0.2"
      />
    </svg>
  );
};
