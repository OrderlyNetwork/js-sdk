import React from "react";

export const LoadingIcon: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 24, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 25 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.5 4C11.5 3.44772 11.9477 3 12.5 3C17.4701 3 21.5 7.02994 21.5 12C21.5 16.9701 17.4701 21 12.5 21C7.52994 21 3.5 16.9701 3.5 12C3.5 11.4477 3.94772 11 4.5 11C5.05228 11 5.5 11.4477 5.5 12C5.5 15.8655 8.63451 19 12.5 19C16.3655 19 19.5 15.8655 19.5 12C19.5 8.13451 16.3655 5 12.5 5C11.9477 5 11.5 4.55228 11.5 4Z"
        fill="currentColor"
      />
    </svg>
  );
};
