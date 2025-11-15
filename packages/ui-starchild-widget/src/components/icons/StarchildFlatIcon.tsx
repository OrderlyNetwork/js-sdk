import React from "react";

export interface StarchildFlatIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const StarchildFlatIcon: React.FC<StarchildFlatIconProps> = ({
  size = 40,
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_13826_97297)">
        <rect width="40" height="40" rx="8" fill="#F84600" />
        <path
          d="M8.50081 11.2119L20.0527 4.54683L20.0527 59.3887L8.50081 56.1347L8.50081 11.2119Z"
          fill="white"
          fillOpacity="0.2"
        />
        <path
          d="M8.50081 11.2119L20.0527 4.54683L20.0527 59.3887L8.50081 56.1347L8.50081 11.2119Z"
          fill="url(#paint0_linear_13826_97297)"
        />
        <path
          d="M31.6047 11.2725L20.0527 4.60737L20.0527 59.4492L31.6047 56.1953L31.6047 11.2725Z"
          fill="white"
          fillOpacity="0.2"
        />
        <path
          d="M31.6047 11.2725L20.0527 4.60737L20.0527 59.4492L31.6047 56.1953L31.6047 11.2725Z"
          fill="url(#paint1_linear_13826_97297)"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_13826_97297"
          x1="33.3615"
          y1="-51.3688"
          x2="-2.24997"
          y2="55.4289"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopOpacity="0" />
          <stop offset="0.618007" stopOpacity="0.97" />
          <stop offset="0.869792" stopColor="#525252" />
          <stop offset="0.961538" stopColor="#989898" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_13826_97297"
          x1="11.5945"
          y1="-48.2099"
          x2="55.2417"
          y2="56.9781"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" stopOpacity="0.97" />
          <stop offset="0.724346" />
          <stop offset="1" stopOpacity="0" />
        </linearGradient>
        <clipPath id="clip0_13826_97297">
          <rect width="40" height="40" rx="8" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
