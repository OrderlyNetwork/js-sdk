import React, { FC } from "react";
import { SVGProps } from "react";

interface ArrowDownToLine extends SVGProps<SVGSVGElement> {
  size?: number;
}

export const ArrowDownToLineIcon: FC<ArrowDownToLine> = (props) => {
  const { size = 10, ...rest } = props;

  return (
    <svg
      width={`${size}px`}
      height={`${size}px`}
      viewBox="0 0 10 10"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M5.62504 0.3125H4.37504V5.99108L2.00449 3.62053L1.12061 4.50441L5.00005 8.38385L8.87949 4.50441L7.99561 3.62053L5.62504 5.9911V0.3125Z"
        // fill="white"
        // fillOpacity="0.36"
      />
      <path
        d="M1.25004 8.4375H8.75004V9.6875H1.25004V8.4375Z"
        // fill="white"
        // fillOpacity="0.36"
      />
    </svg>
  );
};
