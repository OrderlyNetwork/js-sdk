import React, { FC } from "react";
import { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export const CandlesIcon: FC<IconProps> = (props) => {
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
        d="M7.25 2.5V4H8.5C8.77614 4 9 4.22386 9 4.5V15.5C9 15.7761 8.77614 16 8.5 16H7.25V17.5C7.25 17.7761 7.02614 18 6.75 18H6.25C5.97386 18 5.75 17.7761 5.75 17.5V16H4.5C4.22386 16 4 15.7761 4 15.5V4.5C4 4.22386 4.22386 4 4.5 4H5.75V2.5C5.75 2.22386 5.97386 2 6.25 2H6.75C7.02614 2 7.25 2.22386 7.25 2.5ZM5.5 5.5V14.5H7.5V5.5H5.5ZM14.25 4.5V7H15.5C15.7761 7 16 7.22386 16 7.5V15.5C16 15.7761 15.7761 16 15.5 16H14.25V17.5C14.25 17.7761 14.0261 18 13.75 18H13.25C12.9739 18 12.75 17.7761 12.75 17.5V16H11.5C11.2239 16 11 15.7761 11 15.5V7.5C11 7.22386 11.2239 7 11.5 7H12.75V4.5C12.75 4.22386 12.9739 4 13.25 4H13.75C14.0261 4 14.25 4.22386 14.25 4.5ZM12.5 8.5V14.5H14.5V8.5H12.5Z"
      />
    </svg>
  );
};
