import { FC } from "react";

export const InfoIcon: FC<{
  className?: string;
}> = (props) => {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="#fff"
      fillOpacity=".36"
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
    >
      <path d="M0 6a6 6 0 1 1 12 0A6 6 0 0 1 0 6m6.714-2.25V2.321H5.286V3.75zm-.058 1.125H5.344V9.75h1.312z" />
    </svg>
  );
};
