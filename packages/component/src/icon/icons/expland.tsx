import React, { FC } from "react";
import { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size: number;
  className?: string | undefined;
}

export const ExpandIcon: FC<IconProps> = (props) => {
  const { size = 16, className, viewBox, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={`${size}px`}
      height={`${size}px`}
      fill="currentColor"
      viewBox={`0 0 16 16`}
      {...rest}
      className={`${className}`}
    >
      <path d="M8 10.425L4 6.42501L4.85 5.57501L8 8.72501L11.15 5.57501L12 6.42501L8 10.425Z" />
    </svg>
  );
};
