import React, { FC } from "react";
import { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size: number;
}

export const InfoIcon: FC<IconProps> = (props) => {
  const { size = 12, viewBox, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={`${size}px`}
      height={`${size}px`}
      fill="none"
      viewBox={`0 0 14 14`}
      {...rest}
    >
      <g clipPath="url(#clip0_1499_214747)">
        <path
          fill="currentColor"
          //   fillOpacity="0.36"
          d="M0 7a7 7 0 1114 0A7 7 0 010 7zm7.833-2.625V2.708H6.167v1.667h1.666zm-.067 1.313H6.234v5.687h1.532V5.687z"
        ></path>
      </g>
      <defs>
        <clipPath id="clip0_1499_214747">
          <path fill="#fff" d="M0 0H14V14H0z"></path>
        </clipPath>
      </defs>
    </svg>
  );
};
