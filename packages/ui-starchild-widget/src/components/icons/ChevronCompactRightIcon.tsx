import React from "react";

export const ChevronCompactRightIcon: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 14, className = "" }) => {
  return (
    <svg
      width={size * (9 / 14)}
      height={size}
      viewBox="0 0 9 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M5.51601 11.0691C5.65663 11.0989 5.80794 11.086 5.93676 10.9962C6.19382 10.8177 6.26582 10.4444 6.09425 10.176L4.06251 7.00446L6.09425 3.83231C6.26582 3.56456 6.19382 3.19064 5.93676 3.01215C5.67913 2.83365 5.32026 2.90832 5.14869 3.17606L2.90658 6.67606C2.78114 6.87206 2.78114 7.1363 2.90658 7.3323L5.14869 10.8323C5.23419 10.9665 5.37538 11.04 5.51601 11.0691Z"
        fill="currentColor"
        fillOpacity="0.54"
      />
    </svg>
  );
};
