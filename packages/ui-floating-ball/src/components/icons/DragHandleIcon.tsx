import React from "react";

export const DragHandleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => (
  <svg
    width="10"
    height="16"
    viewBox="0 0 10 16"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect x="2" y="2" width="6" height="2" rx="1" />
    <rect x="2" y="7" width="6" height="2" rx="1" />
    <rect x="2" y="12" width="6" height="2" rx="1" />
  </svg>
);
