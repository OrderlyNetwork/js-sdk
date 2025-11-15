import React from "react";

export const ShieldShadedIcon: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 24, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12.123 2.03413C11.2443 2.40913 5.97045 4.66013 5.09185 5.03513C4.72335 5.19213 4.49805 5.54014 4.49805 5.94114C4.49845 10.3211 4.67295 12.2811 5.46685 14.5381C6.50645 17.4931 8.54605 19.8482 11.998 21.8212C12.3054 21.9972 12.6905 21.9972 12.998 21.8212C16.4813 19.8302 18.53 17.4831 19.5606 14.5381C20.3446 12.2971 20.4981 10.4331 20.4981 5.94114C20.4981 5.54214 20.2712 5.19313 19.9042 5.03513L12.9355 2.03413C12.6841 1.92612 12.3747 1.92612 12.123 2.03413ZM12.498 4.00312L18.4944 6.60615C18.5814 13.7812 17.1748 16.9262 12.5073 19.7872C12.498 17.9532 12.498 4.95312 12.498 4.00312Z"
        fill="url(#paint0_linear_shield_shaded)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_shield_shaded"
          x1="20.4981"
          y1="11.9531"
          x2="4.49805"
          y2="11.9531"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#59B0FE" />
          <stop offset="1" stopColor="#26FEFE" />
        </linearGradient>
      </defs>
    </svg>
  );
};
