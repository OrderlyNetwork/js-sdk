import React, { FC } from "react";
import { SVGProps } from "react";

interface RadioIconProps extends SVGProps<SVGSVGElement> {
  size: number;
}

export const RadioIcon: FC<RadioIconProps> = (props) => {
  const { size = 20, ...rest } = props;

  return (
    <svg
      width={`${size}px`}
      height={`${size}px`}
      viewBox="0 0 20 20"
      fill="white"
      fillOpacity={0.2}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <rect
        x="0.666626"
        y="0.626831"
        width="20"
        height="20"
        rx="10"
        fill="white"
        fillOpacity="0.12"
      />
      <rect
        x="4"
        y="3.96017"
        width="13.3333"
        height="13.3333"
        rx="6.66667"
        fill="white"
        fillOpacity="0.98"
      />
    </svg>
  );
};
