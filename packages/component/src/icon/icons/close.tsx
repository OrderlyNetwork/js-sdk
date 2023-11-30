import React, { FC } from "react";
import { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size: number;
}

export const CloseIcon: FC<IconProps> = (props) => {
  const { size = 20, viewBox, ...rest } = props;
  return (
    <svg
      width={`${size}px`}
      height={`${size}px`}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M8.23524 10.0026L2.55664 15.6812L4.32441 17.4489L10.003 11.7703L15.6816 17.449L17.4494 15.6812L11.7708 10.0026L17.4494 4.32392L15.6816 2.55615L10.003 8.23479L4.32441 2.55619L2.55664 4.32396L8.23524 10.0026Z"
        fill="white"
        fillOpacity="0.8"
      />
    </svg>
  );
};
