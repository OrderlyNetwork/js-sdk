import React from "react";

export interface StarchildIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const StarchildIcon: React.FC<StarchildIconProps> = ({
  size = 60,
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g filter="url(#filter0_d_13726_29646)">
        <g clipPath="url(#clip0_13726_29646)">
          <rect x="8" y="8" width="44" height="44" rx="12" fill="#F84600" />
          <path
            d="M17.3505 20.3337L30.0576 13.0021L30.0576 73.3281L17.3505 69.7488L17.3505 20.3337Z"
            fill="white"
            fillOpacity="0.2"
          />
          <path
            d="M17.3505 20.3337L30.0576 13.0021L30.0576 73.3281L17.3505 69.7488L17.3505 20.3337Z"
            fill="url(#paint0_linear_13726_29646)"
          />
          <path
            d="M42.7647 20.3982L30.0576 13.0665L30.0576 73.3926L42.7647 69.8132L42.7647 20.3982Z"
            fill="white"
            fillOpacity="0.2"
          />
          <path
            d="M42.7647 20.3982L30.0576 13.0665L30.0576 73.3926L42.7647 69.8132L42.7647 20.3982Z"
            fill="url(#paint1_linear_13726_29646)"
          />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_d_13726_29646"
          x="0"
          y="0"
          width="60"
          height="60"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology
            radius="2"
            operator="dilate"
            in="SourceAlpha"
            result="effect1_dropShadow_13726_29646"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="3" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.972549 0 0 0 0 0.27451 0 0 0 0 0 0 0 0 0.36 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_13726_29646"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_13726_29646"
            result="shape"
          />
        </filter>
        <linearGradient
          id="paint0_linear_13726_29646"
          x1="44.6973"
          y1="-48.5051"
          x2="5.52464"
          y2="68.9723"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopOpacity="0" />
          <stop offset="0.618007" stopOpacity="0.97" />
          <stop offset="0.869792" stopColor="#525252" />
          <stop offset="0.961538" stopColor="#989898" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_13726_29646"
          x1="20.7535"
          y1="-45.0325"
          x2="68.7655"
          y2="70.6743"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" stopOpacity="0.97" />
          <stop offset="0.724346" />
          <stop offset="1" stopOpacity="0" />
        </linearGradient>
        <clipPath id="clip0_13726_29646">
          <rect x="8" y="8" width="44" height="44" rx="12" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
