import React from "react";
export const NoData = (
  props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>
) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={101}
    height={101}
    fill="none"
    {...props}
  >
    <path fill="#070B0E" d="M12.5 17.5h54v79h-54z" opacity={0.4} />
    <path fill="#070B0E" d="M32.5 9.5h54v79h-54z" opacity={0.4} />
    <path fill="#282E3A" d="M27.5 3.5h54v79h-54z" />
    <path fill="#212633" d="M16.5 15.5h42.98L70.5 26.484V82.5h-54v-67Z" />
    <path fill="#333948" d="m65.897 68.162 2.77-2.77 5.541 5.54-2.77 2.771z" />
    <path fill="#282E3A" d="M8.5 12.5h43.776L63.5 23.627V91.5h-55v-79Z" />
    <path fill="#4B5369" d="m52.5 12.5 11 11h-11v-11Z" />
    <rect
      width={29}
      height={2}
      x={18.5}
      y={24.5}
      fill="#fff"
      fillOpacity={0.12}
      rx={1}
    />
    <rect
      width={36}
      height={2}
      x={18.5}
      y={33.5}
      fill="#fff"
      fillOpacity={0.12}
      rx={1}
    />
    <rect
      width={36}
      height={2}
      x={18.5}
      y={42.5}
      fill="#fff"
      fillOpacity={0.12}
      rx={1}
    />
    <rect
      width={36}
      height={2}
      x={18.5}
      y={51.5}
      fill="#fff"
      fillOpacity={0.12}
      rx={1}
    />
    <rect
      width={36}
      height={2}
      x={18.5}
      y={60.5}
      fill="#fff"
      fillOpacity={0.12}
      rx={1}
    />
    <rect
      width={36}
      height={2}
      x={18.5}
      y={69.5}
      fill="#fff"
      fillOpacity={0.12}
      rx={1}
    />
    <rect
      width={36}
      height={2}
      x={18.5}
      y={78.5}
      fill="#fff"
      fillOpacity={0.12}
      rx={1}
    />
    <ellipse cx={52.5} cy={52} fill="#6E7076" rx={22} ry={21.5} />
    <ellipse cx={52.5} cy={52} fill="#878C99" rx={20} ry={20.5} />
    <mask
      id="a"
      width={37}
      height={36}
      x={34}
      y={34}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: "alpha",
      }}
    >
      <circle cx={52.465} cy={51.959} r={17.91} fill="#252A36" />
    </mask>
    <g mask="url(#a)">
      <path fill="#202632" d="M32.876 30.131h39.738v43.656H32.876z" />
      <path fill="#282E3A" d="M28.958 25.653h36.939v52.611H28.958z" />
      <rect
        width={30.783}
        height={4}
        x={23.921}
        y={38.646}
        fill="#fff"
        fillOpacity={0.12}
        rx={2}
      />
      <rect
        width={30.783}
        height={4}
        x={23.921}
        y={50.646}
        fill="#fff"
        fillOpacity={0.12}
        rx={2}
      />
      <rect
        width={30.783}
        height={4}
        x={23.921}
        y={62.646}
        fill="#fff"
        fillOpacity={0.12}
        rx={2}
      />
    </g>
    <rect
      width={29.628}
      height={7.836}
      x={72.55}
      y={66.502}
      fill="#333948"
      rx={3}
      transform="rotate(45 72.55 66.502)"
    />
    <rect
      width={26.496}
      height={2.19}
      x={72.483}
      y={68.748}
      fill="#525C76"
      rx={1.095}
      transform="rotate(45 72.483 68.748)"
    />
  </svg>
);
