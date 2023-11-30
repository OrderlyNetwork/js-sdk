import React, { FC } from "react";
import { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size: number;
}

export const CopyIcon: FC<IconProps> = (props) => {
  const { size = 40, viewBox, ...rest } = props;
  return (
    <svg
      width={`${size}px`}
      height={`${size}px`}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="40" height="40" rx="20" fill="#282E3A" />
      <path
        d="M13.75 23.75V13.75H23.75V11.25H11.25V23.75H13.75Z"
        fill="white"
        fillOpacity="0.54"
      />
      <path
        d="M16.25 16.25H28.75V28.75H16.25V16.25Z"
        fill="white"
        fillOpacity="0.54"
      />
    </svg>
  );
};
