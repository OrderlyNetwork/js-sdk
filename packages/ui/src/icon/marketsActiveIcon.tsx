import { BaseIcon, BaseIconProps } from "./baseIcon";

export const MarketsActiveIcon = (props: BaseIconProps) => {
  return (
    <BaseIcon {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.75 8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zm-7 4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2z"
        fill="#fff"
        fillOpacity=".16"
      />
      <path
        d="M16.75 6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"
        fill="url(#a)"
      />
      <defs>
        <linearGradient
          id="a"
          x1="22.75"
          y1="12"
          x2="16.75"
          y2="12"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="rgb(var(--oui-gradient-brand-end))" />
          <stop offset="1" stopColor="rgb(var(--oui-gradient-brand-start))" />
        </linearGradient>
      </defs>
      {/* <g id="Trading">
        <path
          id="Vector 646 (Stroke)"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.5 7C2.5 6.44772 2.94772 6 3.5 6H5.66905C7.77663 6 9.72966 7.10579 10.814 8.91303L13.901 14.058C14.6239 15.2628 15.9259 16 17.3309 16H19.5V14L22.5 17L19.5 20V18H17.3309C15.2234 18 13.2703 16.8942 12.186 15.087L9.09902 9.94202C8.37613 8.7372 7.0741 8 5.66905 8H3.5C2.94772 8 2.5 7.55228 2.5 7Z"
          fill="url(#paint0_linear_134_17004)"
        />
        <path
          id="Subtract"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.5 18C2.94772 18 2.5 17.5523 2.5 17C2.5 16.4477 2.94772 16 3.5 16H5.66905C7.0741 16 8.37613 15.2628 9.09902 14.058L10.3338 12L11.5 13.9436L10.814 15.087C9.72966 16.8942 7.77663 18 5.66905 18H3.5ZM12.6662 12L13.901 9.94202C14.6239 8.7372 15.9259 8 17.3309 8H19.5V10L22.5 7L19.5 4V6H17.3309C15.2234 6 13.2703 7.10579 12.186 8.91303L11.5 10.0563L12.6662 12Z"
          fill="white"
          fillOpacity="0.36"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_134_17004"
          x1="22.5"
          y1="13"
          x2="2.5"
          y2="13"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="rgb(var(--oui-gradient-brand-end))" />
          <stop offset="1" stopColor="rgb(var(--oui-gradient-brand-start))" />
        </linearGradient>
      </defs> */}
    </BaseIcon>
  );
};
