import React, { FC } from "react";
import { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size: number;
}

export const CloseIcon: FC<IconProps> = (props) => {
  const { size = 16, viewBox, ...rest } = props;
  return (
    <svg
      width={`${size}px`}
      height={`${size}px`}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M3.32972 2.60449C3.15912 2.60449 2.98072 2.66183 2.85052 2.79183C2.59019 3.0525 2.59019 3.48982 2.85052 3.75049L7.03806 7.93782L2.85052 12.1252C2.59019 12.3858 2.59019 12.8232 2.85052 13.0838C3.11092 13.3438 3.54852 13.3438 3.80892 13.0838L7.99639 8.89649L12.1839 13.0838C12.4443 13.3438 12.8819 13.3438 13.1423 13.0838C13.4026 12.8232 13.4026 12.3858 13.1423 12.1252L8.95472 7.93782L13.1423 3.75049C13.4026 3.48982 13.4026 3.0525 13.1423 2.79183C13.0121 2.66183 12.8336 2.60449 12.6631 2.60449C12.4925 2.60449 12.3141 2.66183 12.1839 2.79183L7.99639 6.97916L3.80892 2.79183C3.67872 2.66183 3.50032 2.60449 3.32972 2.60449Z"
        fill="currentColor"
      />
    </svg>
  );
};