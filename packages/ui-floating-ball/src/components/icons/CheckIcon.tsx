import React from "react";

export const CheckIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 54,
  className = "",
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 54 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M42.7913 13.4922C42.2153 13.4922 41.6145 13.6812 41.1758 14.1132L21.585 33.4497C21.0068 34.0189 20.4263 33.9132 19.9718 33.2427L13.2307 23.2977C12.5422 22.2829 11.1022 21.9994 10.0695 22.6767C9.03899 23.3539 8.751 24.7692 9.4395 25.784L16.1782 35.7289C18.2078 38.7192 22.161 39.0994 24.7463 36.5569L44.4068 17.2902C45.282 16.4262 45.282 14.9772 44.4068 14.1132C43.968 13.6812 43.3651 13.4922 42.7913 13.4922Z"
        fill="#FFF0DB"
      />
    </svg>
  );
};
