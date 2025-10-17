import { FC, SVGProps } from "react";

export const StarchildIcon: FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_13826_95704)">
        <rect width="14" height="14" rx="4" fill="#F84600" />
        <path
          d="M2.97538 3.92525L7.01856 1.59246L7.01855 20.7871L2.97538 19.6482L2.97538 3.92525Z"
          fill="white"
          fillOpacity="0.2"
        />
        <path
          d="M2.97538 3.92525L7.01856 1.59246L7.01855 20.7871L2.97538 19.6482L2.97538 3.92525Z"
          fill="url(#paint0_linear_13826_95704)"
        />
        <path
          d="M11.0617 3.94478L7.01855 1.61199L7.01855 20.8066L11.0617 19.6678L11.0617 3.94478Z"
          fill="white"
          fillOpacity="0.2"
        />
        <path
          d="M11.0617 3.94478L7.01855 1.61199L7.01855 20.8066L11.0617 19.6678L11.0617 3.94478Z"
          fill="url(#paint1_linear_13826_95704)"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_13826_95704"
          x1="11.6766"
          y1="-17.978"
          x2="-0.787393"
          y2="19.4012"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopOpacity="0" />
          <stop offset="0.618007" stopOpacity="0.97" />
          <stop offset="0.869792" stopColor="#525252" />
          <stop offset="0.961538" stopColor="#989898" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_13826_95704"
          x1="4.05816"
          y1="-16.8741"
          x2="19.3347"
          y2="19.9417"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" stopOpacity="0.97" />
          <stop offset="0.724346" />
          <stop offset="1" stopOpacity="0" />
        </linearGradient>
        <clipPath id="clip0_13826_95704">
          <rect width="14" height="14" rx="4" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
