import React, { FC } from "react";
import { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export const KChartIcon: FC<IconProps> = (props) => {
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
        d="M13.3692 6.10168L17.1713 13.706L18.662 12.9606L14.4693 4.57514C13.999 3.63466 12.6484 3.65966 12.2133 4.61691L8.86695 11.9788L7.17776 10.531C6.5793 10.018 5.66123 10.1802 5.2748 10.8672L1.77368 17.0914L3.22631 17.9085L6.47854 12.1268L8.20331 13.6052C8.83532 14.1469 9.81031 13.9311 10.1548 13.1733L13.3692 6.10168Z"
      />
      <circle cx="2.49996" cy="8.75002" r="0.833333" />
      <circle cx="5.41671" cy="8.75002" r="0.833333" />
      <circle cx="8.33333" cy="8.75002" r="0.833333" />
      <circle cx="13.3333" cy="8.75002" r="0.833333" />
      <circle cx="17.5" cy="8.75002" r="0.833333" />
    </svg>
  );
};
