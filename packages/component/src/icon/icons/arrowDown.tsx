import React, { FC } from "react";
import { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size: number;
  className?: string | undefined;
}

export const ArrowDownIcon: FC<IconProps> = (props) => {
  const { size = 16, ...rest } = props;
  return (
    <svg
      width={`${size}px`}
      height={`${size}px`}
      viewBox="0 0 16 17"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M3.41 5.07129L8 9.30958L12.59 5.07129L14 6.37609L8 11.9284L2 6.37609L3.41 5.07129Z"
        // fill="white"
        // fillOpacity="0.54"
      />
    </svg>
  );
};
