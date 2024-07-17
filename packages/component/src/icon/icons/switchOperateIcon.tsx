import React, { FC } from "react";
import { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {}

export const SwitchOperateIcon: FC<IconProps> = (props) => {
  return (
    <svg
      width="10"
      height="16"
      viewBox="0 0 10 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x="2" y="2" width="6" height="2" rx="1" fill="currentColor" />
      <rect x="2" y="7" width="6" height="2" rx="1" fill="currentColor" />
      <rect x="2" y="12" width="6" height="2" rx="1" fill="currentColor" />
    </svg>
  );
};
