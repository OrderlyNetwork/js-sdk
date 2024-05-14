import React, { FC } from "react";
import { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size: number;
  className?: string | undefined;
}

export const CheckSmallIcon: FC<IconProps> = (props) => {
  const { size = 20, className, viewBox, ...rest } = props;
  return (
    <svg
      width={`${size}px`}
      height={`${size}px`}
      viewBox="0 0 13 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.5 0H6.5C9.81371 0 12.5 2.68629 12.5 6V12H6.5C3.18629 12 0.5 9.31371 0.5 6V0Z"
        fill="white"
      />
      <path
        d="M5.5 8.31877L3.5 6.31877L4.1375 5.68127L5.5 7.04377L8.8625 3.68127L9.5 4.31877L5.5 8.31877Z"
        fill="#1C1B1F"
      />
    </svg>
  );
};
