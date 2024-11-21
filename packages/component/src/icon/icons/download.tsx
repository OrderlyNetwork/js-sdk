import React, { FC } from "react";
import { SVGProps } from "react";

interface IconProps extends SVGProps<SVGSVGElement> {
  size: number;
}

export const DownloadIcon: FC<IconProps> = (props) => {
  const { size = 36, ...rest } = props;

  return (
    <svg
      width="37"
      height="36"
      viewBox="0 0 37 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <rect x="0.5" width="36" height="36" rx="18" fill="#333948" />
      <path
        d="M19.5001 10.5H17.5001V19.5857L13.7072 15.7928L12.293 17.2071L18.5001 23.4142L24.7072 17.2071L23.293 15.7928L19.5001 19.5858V10.5Z"
        fill="white"
        fillOpacity="0.98"
      />
      <path
        d="M12.5001 23.5H24.5001V25.5H12.5001V23.5Z"
        fill="white"
        fillOpacity="0.98"
      />
    </svg>
  );
};
