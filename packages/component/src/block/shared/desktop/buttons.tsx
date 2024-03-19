import { FC, PropsWithChildren } from "react";

type PropType = PropsWithChildren<
React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>
>;

export const PrevButton: FC<PropType> = (props) => {
const { children, ...restProps } = props;

return (
  <button {...restProps}>
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="24" height="24" rx="12" fill="#333948" />
      <path
        d="M15.4285 6.49199L10.3425 12L15.4285 17.508L13.8627 19.2L7.19989 12L13.8627 4.79999L15.4285 6.49199Z"
        fill="#868F99"
      />
    </svg>
  </button>
);
};

export const NextButton: FC<PropType> = (props) => {
  const { children, ...restProps } = props;

  return (
    <button {...restProps}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="24" height="24" rx="12" fill="#333948" />
        <path
          d="M8.57397 17.508L13.6599 12L8.57398 6.49198L10.1397 4.79998L16.8025 12L10.1397 19.2L8.57397 17.508Z"
          fill="#868F99"
        />
      </svg>
    </button>
  );
};
