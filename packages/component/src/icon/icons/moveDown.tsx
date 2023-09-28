import React, { FC } from "react";
import { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export const MoveDownIcon: FC<IconProps> = (props) => {
  const { size = 20, viewBox, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={`${size}px`}
      height={`${size}px`}
      fill="none"
      viewBox={`0 0 21 20`}
      {...rest}
    >
      <path
        fill="currentColor"
        d="M2.924 9.161l-1.208 1.36 8.182 7.272.604.548.604-.548 8.181-7.273-1.207-1.359-6.67 5.928V1.66H9.594v13.43l-6.67-5.928z"
      ></path>
    </svg>
  );
};
