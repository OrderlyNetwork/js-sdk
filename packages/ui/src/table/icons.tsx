import { PropsWithChildren } from "react";

const BaseSortIcon = (props: PropsWithChildren) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
    >
      {props.children}
    </svg>
  );
};

export const SortingIcon = () => {
  return (
    <BaseSortIcon>
      <path
        d="M5 1.042a.47.47 0 0 0-.338.135L2.166 3.844c-.206.22-.005.531.338.531h4.992c.342 0 .543-.311.337-.531L5.338 1.177A.47.47 0 0 0 5 1.042m0 7.916a.47.47 0 0 1-.338-.135L2.166 6.156c-.206-.22-.005-.531.338-.531h4.992c.342 0 .543.311.337.531L5.338 8.823A.47.47 0 0 1 5 8.958"
        fill="#fff"
        fillOpacity=".2"
      />
    </BaseSortIcon>
  );
};

export const AscendingIcon = () => {
  return (
    <BaseSortIcon>
      <path
        d="M5 1.042a.47.47 0 0 0-.338.135L2.166 3.844c-.206.22-.005.531.338.531h4.992c.342 0 .543-.311.337-.531L5.338 1.177A.47.47 0 0 0 5 1.042"
        fill="#fff"
        fillOpacity=".8"
      />
      <path
        d="M5 8.958a.47.47 0 0 1-.338-.135L2.166 6.156c-.206-.22-.005-.531.338-.531h4.992c.342 0 .543.311.337.531L5.338 8.823A.47.47 0 0 1 5 8.958"
        fill="#fff"
        fillOpacity=".2"
      />
    </BaseSortIcon>
  );
};

export const DescendingIcon = () => {
  return (
    <BaseSortIcon>
      <path
        d="M5 1.042a.47.47 0 0 0-.338.135L2.166 3.844c-.206.22-.005.531.338.531h4.992c.342 0 .543-.311.337-.531L5.338 1.177A.47.47 0 0 0 5 1.042"
        fill="#fff"
        fillOpacity=".2"
      />
      <path
        d="M5 8.958a.47.47 0 0 1-.338-.135L2.166 6.156c-.206-.22-.005-.531.338-.531h4.992c.342 0 .543.311.337.531L5.338 8.823A.47.47 0 0 1 5 8.958"
        fill="#fff"
        fillOpacity=".8"
      />
    </BaseSortIcon>
  );
};
