import React, { FC } from "react";
import { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size: number;
}

export const WalletIcon: FC<IconProps> = (props) => {
  const { size = 20, viewBox, ...rest } = props;

  return (
    <svg
      width={`${size}px`}
      height={`${size}px`}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <rect width="20" height="20" rx="10" fill="#333948" />
      <path
        d="M13.2727 11.0908H12.1818V12.1817H13.2727V11.0908Z"
        fill="white"
        fillOpacity="0.8"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.72723 5.09082C6.63487 5.09082 6.54384 5.09656 6.4545 5.1077C5.46758 5.23077 4.68536 6.01299 4.56229 6.99991C4.55686 7.04346 4.55271 7.0874 4.54989 7.13171C4.54692 7.1783 4.54541 7.22529 4.54541 7.27264V13.2726C4.54541 14.4776 5.52224 15.4545 6.72723 15.4545H15.4545V7.81809H14.909V5.09082H6.72723ZM6.4545 6.18173H13.8181V7.81809H6.4545C6.04565 7.81809 5.70684 7.51821 5.64604 7.1264C5.63964 7.08517 5.63632 7.04293 5.63632 6.99991C5.63632 6.54804 6.00263 6.18173 6.4545 6.18173ZM5.63632 8.72528V13.2726C5.63632 13.8751 6.12474 14.3635 6.72723 14.3635H14.3636V8.909H6.4545C6.1617 8.909 5.8843 8.84309 5.63632 8.72528Z"
        fill="white"
        fillOpacity="0.8"
      />
    </svg>
  );
};
