import React, { FC } from "react";
import { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export const LineIcon: FC<IconProps> = (props) => {
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
        d="M18.3 2.72288C18.542 2.85596 18.6303 3.15999 18.4972 3.40195L13.495 12.4968C13.0776 13.2557 12.1061 13.5044 11.3754 13.0394L7.19878 10.3816L2.97738 17.558C2.83737 17.796 2.53092 17.8754 2.2929 17.7354L1.43097 17.2284C1.19295 17.0884 1.1135 16.7819 1.25351 16.5439L5.73746 8.92122C6.16792 8.18943 7.1194 7.96045 7.83567 8.41626L11.9995 11.0659L16.7448 2.43811C16.8778 2.19615 17.1819 2.10788 17.4238 2.24096L18.3 2.72288Z"
      />
    </svg>
  );
};
