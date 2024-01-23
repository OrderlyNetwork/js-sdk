import React, { FC } from "react";
import { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size: number;
  className?: string | undefined;
}

export const ArrowRightIcon: FC<IconProps> = (props) => {
  const { size = 8, className, viewBox, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={`${size}px`}
      height={`${size}px`}
      fill="currentColor"
      viewBox={`0 0 8 8`}
      {...rest}
      className={`${className}`}
    >
      <path
        fill="#fff"
        fillOpacity="0.54"
        d="M4 8l-.712-.7 2.8-2.8H0v-1h6.088L3.288.7 4 0l4 4-4 4z"
      />
    </svg>
  );
};
