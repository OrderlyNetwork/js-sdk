import React, { FC } from "react";
import { SVGProps } from "react";

interface ShareIconProps extends SVGProps<SVGSVGElement> {
  size: number;
}

export const ShareIcon: FC<ShareIconProps> = (props) => {
  const { size = 20, ...rest } = props;

  return (
    <svg
      width={`${size}px`}
      height={`${size}px`}
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <mask
        id="mask0_3937_6637"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="20"
        height="20"
      >
        <rect width="20" height="20" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_3937_6637)">
        <path
          d="M4.5 17C4.0875 17 3.73437 16.8531 3.44062 16.5594C3.14687 16.2656 3 15.9125 3 15.5V4.5C3 4.0875 3.14687 3.73438 3.44062 3.44063C3.73437 3.14688 4.0875 3 4.5 3H10V4.5H4.5V15.5H15.5V10H17V15.5C17 15.9125 16.8531 16.2656 16.5594 16.5594C16.2656 16.8531 15.9125 17 15.5 17H4.5ZM8.0625 13L7 11.9375L14.4375 4.5H12V3H17V8H15.5V5.5625L8.0625 13Z"
          // fill="white"
          // fill-opacity="0.36"
        />
      </g>
    </svg>
  );
};
