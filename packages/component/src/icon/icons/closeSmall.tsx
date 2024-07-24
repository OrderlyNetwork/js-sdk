import React, { FC } from "react";
import { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size: number;
}

export const CloseSmallIcon: FC<IconProps> = (props) => {
  const { size = 24, viewBox, ...rest } = props;
  return (
    <svg
      width={`${size}px`}
      height={`${size}px`}
      viewBox="0 0 24 24"
      fill="white"
      fillOpacity="0.8"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <mask
        id="mask0_12596_86859"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="24"
        height="24"
      >
        <rect width="24" height="24" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_12596_86859)">
        <path
          d="M8.4 17.0004L7 15.6004L10.6 12.0004L7 8.42539L8.4 7.02539L12 10.6254L15.575 7.02539L16.975 8.42539L13.375 12.0004L16.975 15.6004L15.575 17.0004L12 13.4004L8.4 17.0004Z"
          fill="white"
        />
      </g>
    </svg>
  );
};
