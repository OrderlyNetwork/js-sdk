import React from "react";
import type { BaseIconProps } from "./baseIcon";

export const InfoCircleIcon = React.forwardRef<SVGSVGElement, BaseIconProps>(
  (props, ref) => {
    const { className, opacity = 0.36, ...rest } = props;
    return (
      <svg
        width="16"
        height="17"
        viewBox="0 0 16 17"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        opacity={opacity}
        className={className}
        ref={ref}
        {...rest}
      >
        <path
          d="M7.99925 1.84277C4.31738 1.84277 1.33258 4.82744 1.33258 8.50944C1.33258 12.1914 4.31738 15.1761 7.99925 15.1761C11.6811 15.1761 14.6659 12.1914 14.6659 8.50944C14.6659 4.82744 11.6811 1.84277 7.99925 1.84277ZM7.99925 5.17611C8.36745 5.17611 8.66591 5.47477 8.66591 5.84277C8.66591 6.21077 8.36745 6.50944 7.99925 6.50944C7.63105 6.50944 7.33258 6.21077 7.33258 5.84277C7.33258 5.47477 7.63105 5.17611 7.99925 5.17611ZM7.99925 7.17611C8.36745 7.17611 8.66591 7.47477 8.66591 7.84277V11.1761C8.66591 11.5441 8.36745 11.8428 7.99925 11.8428C7.63105 11.8428 7.33258 11.5441 7.33258 11.1761V7.84277C7.33258 7.47477 7.63105 7.17611 7.99925 7.17611Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);
