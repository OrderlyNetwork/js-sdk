import React, { FC } from "react";
import { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size: number;
}

export const SwitchIcon: FC<IconProps> = (props) => {
  const { size = 8, viewBox, ...rest } = props;
  return (
    <svg
      width={`${size}px`}
      height={`${size}px`}
      viewBox={`0 0 8 8`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M3.1998 8L0.799805 6L3.1998 4L3.1998 5.6H7.1998V6.4H3.1998V8Z"
        fill="white"
        fill-opacity="0.36"
      />
      <path
        d="M7.1998 2L4.7998 0V1.6L0.799805 1.6L0.799805 2.4L4.7998 2.4V4L7.1998 2Z"
        fill="white"
        fill-opacity="0.36"
      />
    </svg>
  );
};
