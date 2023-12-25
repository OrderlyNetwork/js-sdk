import React, { FC } from "react";
import { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size: number;
}

export const CircleCloseIcon: FC<IconProps> = (props) => {
  const { size = 14, ...rest } = props;
  return (
    <svg
      width={`${size}px`}
      height={`${size}px`}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M7 14C10.866 14 14 10.866 14 7C14 3.13401 10.866 0 7 0C3.13401 0 0 3.13401 0 7C0 10.866 3.13401 14 7 14ZM2.66439 10.1019L5.76441 7.00184L2.66439 3.90182L3.90182 2.66439L7.00184 5.7644L10.1019 2.66436L11.3393 3.9018L8.23928 7.00184L11.3393 10.1019L10.1019 11.3393L7.00184 8.23928L3.90182 11.3393L2.66439 10.1019Z"
        fill="white"
        fill-opacity="0.2"
      />
    </svg>
  );
};
