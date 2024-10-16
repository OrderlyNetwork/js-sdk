export const OrderlyIcon = (props: {
    size?: number;
}) => {
    const { size = 20} = props;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#a)">
        <path
          d="M10.025 19.949c5.495 0 9.95-4.455 9.95-9.95 0-5.496-4.455-9.95-9.95-9.95-5.496 0-9.95 4.454-9.95 9.95s4.454 9.95 9.95 9.95"
          fill="url(#b)"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.155 4.893c.065.052.027.155-.056.155H5.95a.087.087 0 0 1-.056-.155 6.54 6.54 0 0 1 4.13-1.461 6.54 6.54 0 0 1 4.131 1.461M7.47 11.787a.25.25 0 0 0-.204-.11H3.83a.118.118 0 0 0-.114.151 6.57 6.57 0 0 0 12.618 0 .118.118 0 0 0-.114-.15h-3.436a.25.25 0 0 0-.205.109 3.11 3.11 0 0 1-2.554 1.33 3.11 3.11 0 0 1-2.555-1.33m4.865-3.882a.25.25 0 0 0 .185.084h3.594c.081 0 .139-.08.112-.156a6.6 6.6 0 0 0-1.107-1.979.24.24 0 0 0-.183-.086H5.113a.24.24 0 0 0-.183.086 6.6 6.6 0 0 0-1.107 1.979.118.118 0 0 0 .112.156H7.53a.25.25 0 0 0 .184-.084 3.1 3.1 0 0 1 2.31-1.024c.917 0 1.74.395 2.31 1.024m.782 3.054a.093.093 0 0 1-.088-.119 3.12 3.12 0 0 0-.108-2.003.093.093 0 0 1 .085-.129h3.387c.043 0 .08.03.088.073a6.6 6.6 0 0 1 .054 2.1.09.09 0 0 1-.089.078zm-6.094-.119a.093.093 0 0 1-.088.119H3.606a.09.09 0 0 1-.09-.077 6.6 6.6 0 0 1 .055-2.101.09.09 0 0 1 .088-.073h3.387c.065 0 .11.068.085.129a3.1 3.1 0 0 0-.109 2.003"
          fill="#fff"
        />
      </g>
      <defs>
        <linearGradient
          id="b"
          x1="10.024"
          y1=".048"
          x2="10.024"
          y2="19.949"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#C750FF" />
          <stop offset="1" stopColor="#5800E8" />
        </linearGradient>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h20v20H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};