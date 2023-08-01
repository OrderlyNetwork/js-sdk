import { FC } from "react";

export interface RiskIndicatorProps {
  className?: string;
  width?: number;
  height?: number;
  lowColor?: string;
  mediumColor?: string;
  highColor?: string;
  level?: "low" | "medium" | "high";
}

export const RiskIndicator: FC<RiskIndicatorProps> = ({
  width = 20,
  height = 10,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox={`0 0 20 16`}
    >
      <path
        fill="#E6C700"
        fillRule="evenodd"
        d="M10 4.818A8.182 8.182 0 0 0 1.818 13H0C0 7.477 4.477 3 10 3s10 4.477 10 10h-1.818A8.182 8.182 0 0 0 10 4.818Z"
        clipRule="evenodd"
      />
      <path
        fill="#FF447C"
        d="M14.09 5.912a8.179 8.179 0 0 1 4.092 7.087H20a9.996 9.996 0 0 0-5-8.662l-.91 1.575Z"
      />
      <path
        fill="#608CFF"
        d="M4.997 4.338A9.996 9.996 0 0 0 0 12.998h1.818a8.179 8.179 0 0 1 4.088-7.085l-.909-1.575Z"
      />
      <circle
        cx={9.875}
        cy={12.837}
        r={0.987}
        fill="#e5e7eb"
        fillOpacity={0.98}
      />
      <path fill="#e5e7eb" fillOpacity={0.98} d="M0 12.344h9.381v.987H0z" />
    </svg>
  );
};
