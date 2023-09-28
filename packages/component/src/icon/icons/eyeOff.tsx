import { FC, SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size: number;
}

export const EyeOffIcon: FC<IconProps> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size}
      height={props.size}
      fill="none"
      viewBox="0 0 12 12"
    >
      <path
        fill="currentcolor"
        d="M1.758 2.737l.818.832C1.574 4.199.694 5.09 0 6.189c1.41 2.228 3.572 3.658 6 3.658.802 0 1.57-.172 2.297-.462L9.394 10.5l.849-.862-7.637-7.763-.848.862zm5.457 5.547c-.355.217-.769.343-1.215.343-1.325 0-2.4-1.092-2.4-2.44 0-.452.124-.873.337-1.235l.72.732a1.44 1.44 0 00-.097.503c0 .809.645 1.464 1.44 1.464.177 0 .34-.04.495-.099l.72.732zM5.027 2.611l1.135 1.154c1.194.082 2.141 1.045 2.222 2.258l2.016 2.05A8.855 8.855 0 0012 6.188c-1.41-2.229-3.572-3.66-6-3.66-.33 0-.654.032-.973.083z"
      ></path>
    </svg>
  );
};
