import { FC } from "react";

export interface RiskIndicatorProps {
  className?: string;
  width?: number;
  height?: number;
  lowColor?: string;
  mediumColor?: string;
  highColor?: string;
  level?: "low" | "medium" | "high";
}

export { RiskIndicator } from "./riskIndicator";

// export const RiskIndicator: FC<RiskIndicatorProps> = ({
//   width = 20,
//   height = 16,
// }) => {
//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       width={width}
//       height={height}
//       fill="none"
//       viewBox="0 0 20 16"
//     >
//       <path
//         fill="url(#paint0_angular_1260_196407)"
//         d="M.189 13a.186.186 0 01-.187-.189 10 10 0 0119.996 0 .186.186 0 01-.187.189h-1.51a.192.192 0 01-.19-.189 8.112 8.112 0 00-16.222 0 .192.192 0 01-.19.189H.188z"
//       ></path>
//       <circle
//         cx="10"
//         cy="13"
//         r="1"
//         fill="#fff"
//         fillOpacity="0.98"
//         transform="rotate(90 10 13)"
//       ></circle>
//       <path
//         fill="#fff"
//         fillOpacity="0.98"
//         d="M10.5 3H20V4H10.5z"
//         transform="rotate(90 10.5 3)"
//       ></path>
//       <defs>
//         <radialGradient
//           id="paint0_angular_1260_196407"
//           cx="0"
//           cy="0"
//           r="1"
//           gradientTransform="matrix(9.09198 0 0 9.06808 10 13)"
//           gradientUnits="userSpaceOnUse"
//         >
//           <stop offset="0" stopColor="#FF4D82"></stop>
//           <stop offset="0.167" stopColor="#E6BF73"></stop>
//           <stop offset="0.25" stopColor="#E6D273"></stop>
//           <stop offset="0.333" stopColor="#E6E673"></stop>
//           <stop offset="0.411" stopColor="#26FEFE"></stop>
//           <stop offset="0.495" stopColor="#59B0FE"></stop>
//         </radialGradient>
//       </defs>
//     </svg>
//   );
// };
