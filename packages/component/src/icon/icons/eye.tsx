import { FC, SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size: number;
}

export const EyeIcon: FC<IconProps> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size}
      height={props.size}
      fill="none"
      viewBox="0 0 12 12"
    >
      <path fill="currentcolor" d="M4.5 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"></path>
      <path
        fill="currentcolor"
        d="M6 9.75c3 0 5.25-2.25 6-3.75-.75-1.5-3-3.75-6-3.75S.75 4.5 0 6c.75 1.5 3 3.75 6 3.75zM6 3a3 3 0 110 6 3 3 0 010-6z"
      ></path>
    </svg>
  );
};
