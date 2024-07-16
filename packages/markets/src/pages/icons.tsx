import React, { FC, SVGProps } from "react";

export const EditIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <mask
      id="a"
      style={{ maskType: "alpha" }}
      maskUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="16"
      height="16"
    >
      <path fill="#D9D9D9" d="M0 0h16v16H0z" />
    </mask>
    <g mask="url(#a)">
      <path d="M3.333 12.667h.95L10.8 6.15l-.95-.95-6.517 6.517zM2.667 14a.65.65 0 0 1-.475-.192.65.65 0 0 1-.192-.475v-1.616a1.32 1.32 0 0 1 .383-.934l8.417-8.4q.2-.183.442-.283.24-.1.508-.1.267 0 .517.1.249.1.433.3l.917.933q.2.184.291.434a1.44 1.44 0 0 1 0 1.008 1.25 1.25 0 0 1-.291.442l-8.4 8.4a1.32 1.32 0 0 1-.933.383zm7.65-8.317L9.85 5.2l.95.95z" />
    </g>
  </svg>
);

export const TrashIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M7.205 1.334c-.345 0-.674.136-.918.38L6.001 2H2.667a.667.667 0 1 0 0 1.334h10.667a.667.667 0 1 0 0-1.334h-3.333l-.287-.286a1.3 1.3 0 0 0-.918-.38zM2.911 4.667l1.018 8.842c.088.66.656 1.158 1.322 1.158h5.498c.666 0 1.235-.497 1.323-1.163l1.019-8.837z" />
  </svg>
);

export const AddIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <mask
      id="a"
      style={{ maskType: "alpha" }}
      maskUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="16"
      height="16"
    >
      <path fill="#D9D9D9" d="M0 0h16v16H0z" />
    </mask>
    <g mask="url(#a)">
      <path d="M7.333 8.667h-4V7.333h4v-4h1.333v4h4v1.334h-4v4H7.333z" />
    </g>
  </svg>
);

export const AllMarketsIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <mask
      id="a"
      style={{ maskType: "alpha" }}
      maskUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="12"
      height="12"
    >
      <path fill="#D9D9D9" d="M0 0h12v12H0z" />
    </mask>
    <g mask="url(#a)">
      <path d="M8.5 10a.48.48 0 0 1-.356-.144A.48.48 0 0 1 8 9.5V7q0-.213.144-.356A.48.48 0 0 1 8.5 6.5h1q.212 0 .356.144A.48.48 0 0 1 10 7v2.5q0 .212-.144.356A.48.48 0 0 1 9.5 10zm-3 0a.48.48 0 0 1-.356-.144A.48.48 0 0 1 5 9.5v-7q0-.212.144-.356A.48.48 0 0 1 5.5 2h1q.213 0 .356.144A.48.48 0 0 1 7 2.5v7q0 .212-.144.356A.48.48 0 0 1 6.5 10zm-3 0a.48.48 0 0 1-.356-.144A.48.48 0 0 1 2 9.5V5q0-.213.144-.356A.48.48 0 0 1 2.5 4.5h1q.212 0 .356.144A.48.48 0 0 1 4 5v4.5q0 .212-.144.356A.48.48 0 0 1 3.5 10z" />
    </g>
  </svg>
);

export const NewListingsIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M5.993.958a.416.416 0 0 0-.41.422v.416a.416.416 0 1 0 .832 0V1.38a.416.416 0 0 0-.422-.422M2.749 2.29a.416.416 0 0 0-.29.714l.291.292a.416.416 0 1 0 .589-.588l-.292-.292a.42.42 0 0 0-.298-.126m6.489 0a.42.42 0 0 0-.286.126l-.292.292a.416.416 0 1 0 .588.588l.292-.292a.416.416 0 0 0-.302-.714m-3.239.753a2.895 2.895 0 0 0-2.913 2.914A2.86 2.86 0 0 0 4.751 8.58v1.123c0 .458.374.833.832.833h.832a.835.835 0 0 0 .833-.833V8.58a2.86 2.86 0 0 0 1.665-2.622 2.895 2.895 0 0 0-2.914-2.914M1.421 5.541a.416.416 0 1 0 0 .833h.417a.416.416 0 1 0 0-.833zm8.74 0a.416.416 0 1 0 0 .833h.416a.417.417 0 1 0 0-.833zM3.037 8.492a.42.42 0 0 0-.287.126l-.291.292a.416.416 0 1 0 .588.588l.292-.292a.416.416 0 0 0-.302-.714m5.913 0a.416.416 0 0 0-.29.714l.292.292a.416.416 0 1 0 .588-.588l-.292-.292a.42.42 0 0 0-.298-.126" />
  </svg>
);

export const FavoritesIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="20"
    height="21"
    viewBox="0 0 20 21"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <mask
      id="a"
      style={{ maskType: "alpha" }}
      maskUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="20"
      height="21"
    >
      <path fill="#D9D9D9" d="M0 .5h20v20H0z" />
    </mask>
    <g mask="url(#a)">
      <path d="m10 14.074-3.2 1.913a.6.6 0 0 1-.332.068.6.6 0 0 1-.277-.101.5.5 0 0 1-.186-.256.5.5 0 0 1-.005-.336l.84-3.556-2.82-2.394a.5.5 0 0 1-.174-.281.6.6 0 0 1 .013-.315.5.5 0 0 1 .173-.252.55.55 0 0 1 .305-.112l3.693-.33 1.467-3.393a.57.57 0 0 1 .211-.255A.54.54 0 0 1 10 4.39q.16 0 .292.083.131.082.211.255l1.467 3.414 3.693.309q.178.014.305.123.126.11.173.262t.002.304a.56.56 0 0 1-.183.27l-2.8 2.395.84 3.556a.5.5 0 0 1-.005.336.5.5 0 0 1-.186.256.6.6 0 0 1-.277.101.6.6 0 0 1-.332-.068z" />
    </g>
  </svg>
);

export const UnFavoritesIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="20"
    height="21"
    viewBox="0 0 20 21"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <mask
      id="a"
      style={{ maskType: "alpha" }}
      maskUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="20"
      height="21"
    >
      <path fill="#D9D9D9" d="M0 .5h20v20H0z" />
    </mask>
    <g mask="url(#a)">
      <path d="M7.333 14.396 10 12.813l2.688 1.583-.709-3 2.313-1.98-3.063-.27L10 6.292 8.77 9.146l-3.062.27 2.334 1.98zM10 14.074l-3.2 1.913a.6.6 0 0 1-.332.068.6.6 0 0 1-.277-.101.5.5 0 0 1-.186-.256.5.5 0 0 1-.005-.336l.84-3.556-2.82-2.394a.5.5 0 0 1-.174-.281.6.6 0 0 1 .013-.315.5.5 0 0 1 .173-.252.55.55 0 0 1 .305-.112l3.693-.33 1.467-3.393a.57.57 0 0 1 .211-.255A.54.54 0 0 1 10 4.39q.16 0 .292.083.131.082.211.255l1.467 3.414 3.693.309q.178.014.305.123.126.11.173.262t.002.304a.56.56 0 0 1-.183.27l-2.8 2.395.84 3.556a.5.5 0 0 1-.005.336.5.5 0 0 1-.186.256.6.6 0 0 1-.277.101.6.6 0 0 1-.332-.068z" />
    </g>
  </svg>
);

export const CirclePlusIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <mask
      id="a"
      style={{ maskType: "alpha" }}
      maskUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="18"
      height="18"
    >
      <path fill="#D9D9D9" d="M0 0h18v18H0z" />
    </mask>
    <g mask="url(#a)">
      <path d="M8.325 12.6h1.35V9.675H12.6v-1.35H9.675V5.4h-1.35v2.925H5.4v1.35h2.925zm.68 3.6a7 7 0 0 1-2.799-.562A7.3 7.3 0 0 1 3.91 14.09a7.3 7.3 0 0 1-1.546-2.296A7 7 0 0 1 1.8 8.99q0-1.49.563-2.794a7.26 7.26 0 0 1 3.843-3.834A7 7 0 0 1 9.009 1.8q1.49 0 2.794.562 1.303.563 2.288 1.547a7.3 7.3 0 0 1 1.547 2.292q.561 1.308.562 2.794a7 7 0 0 1-.562 2.799 7.3 7.3 0 0 1-1.547 2.297 7.3 7.3 0 0 1-2.292 1.547 7 7 0 0 1-2.794.562M9 14.85q2.437 0 4.144-1.706Q14.85 11.437 14.85 9t-1.706-4.144Q11.437 3.15 9 3.15T4.856 4.856 3.15 9t1.706 4.144Q6.563 14.85 9 14.85" />
    </g>
  </svg>
);
