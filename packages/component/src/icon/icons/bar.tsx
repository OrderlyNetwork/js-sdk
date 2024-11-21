import React, { FC } from "react";
import { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export const BarIcon: FC<IconProps> = (props) => {
  const { size = 20, viewBox, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={`${size}px`}
      height={`${size}px`}
      viewBox={`0 0 20 20`}
      {...rest}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13 16C12.7239 16 12.5 15.7761 12.5 15.5V6H11C10.7239 6 10.5 5.77614 10.5 5.5V4.5C10.5 4.22386 10.7239 4 11 4H12.5V2.5C12.5 2.22386 12.7239 2 13 2H14C14.2761 2 14.5 2.22386 14.5 2.5V12H16C16.2761 12 16.5 12.2239 16.5 12.5V13.5C16.5 13.7761 16.2761 14 16 14H14.5V15.5C14.5 15.7761 14.2761 16 14 16H13Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 18C5.72386 18 5.5 17.7761 5.5 17.5V16H4C3.72386 16 3.5 15.7761 3.5 15.5V14.5C3.5 14.2239 3.72386 14 4 14H5.5V4.5C5.5 4.22386 5.72386 4 6 4H7C7.27614 4 7.5 4.22386 7.5 4.5V8H9C9.27614 8 9.5 8.22386 9.5 8.5V9.5C9.5 9.77614 9.27614 10 9 10H7.5V17.5C7.5 17.7761 7.27614 18 7 18H6Z"
      />
    </svg>
  );
};
