import { FC, SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export const LinkDeviceIcon: FC<IconProps> = (props) => {
  const { size = 20, viewBox, ...rest } = props;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path d="M19.167 7.583a1.74 1.74 0 0 0-1.731-1.75h-4.038a1.74 1.74 0 0 0-1.731 1.75v8.167c0 .967.775 1.75 1.73 1.75h4.039a1.74 1.74 0 0 0 1.73-1.75zm-1.154 0v7.584H12.82V7.583A.58.58 0 0 1 13.398 7h4.038a.58.58 0 0 1 .577.583m-2.02 8.75a.58.58 0 0 1-.576.584.58.58 0 0 1-.577-.584.58.58 0 0 1 .577-.583.58.58 0 0 1 .577.583" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.666 5a2.5 2.5 0 0 1 2.5-2.5h10a2.5 2.5 0 0 1 2.5 2.5.08.08 0 0 1-.078.078h-1.51a.08.08 0 0 1-.08-.078.834.834 0 0 0-.833-.833h-10A.834.834 0 0 0 3.333 5v5.633c0 .11.09.2.2.2h7.1c.11 0 .2.09.2.2V12.3a.2.2 0 0 1-.2.2H2.7a.2.2 0 0 0-.2.2v.633c0 .511.308.834.834.834h7.3c.11 0 .2.09.2.2v1.266a.2.2 0 0 1-.2.2h-7.3c-1.465 0-2.5-1.086-2.5-2.5v-1.666c0-.392.27-.72.635-.81.107-.026.198-.113.198-.224z"
      />
    </svg>
  );
};
