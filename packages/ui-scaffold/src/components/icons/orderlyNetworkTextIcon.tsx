import React from "react";
import { BaseIconProps } from "@orderly.network/ui";

export const OrderlyTextIcon = React.forwardRef<SVGSVGElement, BaseIconProps>(
  (props, ref) => {
    const { opacity = 1, ...rest } = props;
    return (
      <svg
        ref={ref}
        width="45"
        height="14"
        viewBox="0 0 45 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...rest}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.352 2.558a.063.063 0 0 1-.04.112H2.419a.063.063 0 0 1-.04-.112A4.73 4.73 0 0 1 5.365 1.5c1.132 0 2.171.396 2.987 1.058M3.518 7.546a.18.18 0 0 0-.148-.08H.886a.085.085 0 0 0-.083.11 4.75 4.75 0 0 0 4.562 3.429 4.75 4.75 0 0 0 4.562-3.43.085.085 0 0 0-.082-.108H7.36a.18.18 0 0 0-.148.079 2.252 2.252 0 0 1-3.694 0m3.518-2.812a.18.18 0 0 0 .134.061h2.598c.06 0 .101-.057.082-.113a4.8 4.8 0 0 0-.801-1.432.17.17 0 0 0-.132-.062H1.814a.17.17 0 0 0-.132.062A4.8 4.8 0 0 0 .88 4.682a.085.085 0 0 0 .081.113h2.6c.05 0 .099-.023.133-.06a2.25 2.25 0 0 1 1.67-.742c.663 0 1.258.286 1.67.741M7.6 6.95a.067.067 0 0 1-.063-.086 2.26 2.26 0 0 0-.079-1.45.067.067 0 0 1 .061-.093h2.45c.03 0 .058.022.063.052a4.8 4.8 0 0 1 .04 1.52.064.064 0 0 1-.065.057zm-4.407-.086a.067.067 0 0 1-.063.086H.723a.064.064 0 0 1-.064-.056 4.8 4.8 0 0 1 .039-1.52.065.065 0 0 1 .063-.053h2.45c.047 0 .079.049.061.093a2.25 2.25 0 0 0-.079 1.45"
          fill="#fff"
          fillOpacity={opacity}
        />
        <path
          d="M11.272 4.438h1.685v1.61l-.275-.312q.237-.511.662-.874.425-.361.949-.487.524-.124 1.073.038v1.585q-.661-.224-1.223-.125-.55.1-.874.475-.312.375-.312.923v3.608h-1.685zm4.148 3.22q0-.923.4-1.697.41-.774 1.123-1.211a2.95 2.95 0 0 1 1.573-.437 2.7 2.7 0 0 1 1.523.437 2.8 2.8 0 0 1 1.01 1.198q.363.762.363 1.71 0 .95-.362 1.71-.35.762-1.011 1.199a2.7 2.7 0 0 1-1.523.437 2.95 2.95 0 0 1-1.573-.437 3.1 3.1 0 0 1-1.124-1.198 3.7 3.7 0 0 1-.4-1.71m1.748 0q0 .5.224.924.225.412.612.65.387.236.861.236.475 0 .862-.237.386-.237.611-.649.225-.424.225-.924 0-.498-.225-.91-.225-.425-.611-.65a1.6 1.6 0 0 0-.862-.237q-.474 0-.861.237a1.6 1.6 0 0 0-.612.65q-.224.412-.224.91m3.395-6.016h1.685v9.237h-1.685zm4.192 5.329h3.97l-.387.537a2 2 0 0 0-.25-.9 1.63 1.63 0 0 0-.612-.623 1.64 1.64 0 0 0-.861-.225q-.487 0-.886.25a1.6 1.6 0 0 0-.625.686 2.1 2.1 0 0 0-.224.961q0 .537.224.974.239.436.662.687.425.25.961.25.525 0 .937-.238.423-.25.661-.674l1.386.624q-.45.787-1.236 1.26-.786.463-1.798.463-.96 0-1.747-.437a3.3 3.3 0 0 1-1.248-1.198 3.34 3.34 0 0 1-.45-1.71q0-.924.437-1.686.45-.775 1.223-1.21.774-.45 1.723-.45 1.061 0 1.885.537.825.536 1.21 1.448.4.898.226 1.96h-5.181zm6.221-2.534h1.685v1.61l-.274-.312q.237-.511.661-.874.425-.361.949-.487.525-.124 1.073.038v1.585q-.661-.224-1.223-.125-.549.1-.874.475-.312.375-.312.923v3.608h-1.685zm4.885-2.796h1.686v9.237H35.86zm4.359 9.324q.224.487.587.737.362.262.836.262.711 0 1.186-.5.487-.486.487-1.26V9.08l.262.35a2.43 2.43 0 0 1-.911 1.011q-.6.362-1.373.362-.8 0-1.386-.337a2.3 2.3 0 0 1-.886-.936q-.312-.6-.312-1.386V4.438h1.685v3.408q0 .436.162.761.162.312.462.5.312.174.761.174.45 0 .8-.175a1.3 1.3 0 0 0 .549-.511q.187-.338.187-.75V4.439H45v5.767q0 .936-.45 1.685a3.07 3.07 0 0 1-1.21 1.186 3.4 3.4 0 0 1-1.698.424q-.973 0-1.735-.474a3.3 3.3 0 0 1-1.186-1.26z"
          fill="#fff"
          fillOpacity={opacity}
        />
      </svg>
    );
  }
);
