import { FC, SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  className?: string | undefined;
}

export const ArrowLeft: FC<IconProps> = (props) => {
  const { className, size = 12, ...rest } = props;
  return (
    <svg
      width={`${size}`}
      height={`${size}`}
      viewBox="0 0 12 12"
      fill="white"
      fillOpacity="0.54"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...rest}
    >
      <path d="M8.14282 2.5575L4.96411 6L8.14282 9.4425L7.16422 10.5L2.99997 6L7.16422 1.5L8.14282 2.5575Z" />
    </svg>
  );
};

export const ArrowRight: FC<IconProps> = (props) => {
  const { className, size = 12, ...rest } = props;
  return (
    <svg
      width={`${size}`}
      height={`${size}`}
      viewBox="0 0 12 12"
      fill="white"
      fillOpacity="0.54"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...rest}
    >
      <path d="M3.85864 9.4425L7.03736 6L3.85864 2.5575L4.83724 1.5L9.0015 6L4.83724 10.5L3.85864 9.4425Z" />
    </svg>
  );
};

export const ArrowDown: FC<IconProps> = (props) => {
  const { className, size = 12, ...rest } = props;
  return (
    <svg
      width={`${size}`}
      height={`${size}`}
      viewBox="0 0 12 12"
      fill="white"
      fillOpacity="0.54"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...rest}
    >
      <path d="M1.73897 3.75C1.53675 3.75 1.42628 3.98732 1.55574 4.14364L5.81677 9.28865C5.91213 9.40378 6.08787 9.40378 6.18323 9.28865L10.4443 4.14364C10.5737 3.98732 10.4633 3.75 10.261 3.75H1.73897Z" />
    </svg>
  );
};
