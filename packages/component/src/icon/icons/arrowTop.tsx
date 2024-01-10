import React, { FC } from "react";
import { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
    size: number;
}

export const ArrowTopIcon: FC<IconProps> = (props) => {
    const { size = 16, viewBox, ...rest } = props;
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={`${size}px`}
            height={`${size}px`}
            fill="white"
            fillOpacity={0.54}
            viewBox={`0 0 16 16`}
            {...rest}
        >
            <path fill-rule="evenodd" clip-rule="evenodd" d="M11.6365 7.58336L8.83366 7.58336L8.83366 15.9167L7.16699 15.9167L7.16699 7.58336L4.36417 7.58336C4.00163 7.58336 3.81204 7.15239 4.05702 6.88514L7.69317 2.91843C7.85831 2.73827 8.14233 2.73827 8.30747 2.91843L11.9436 6.88514C12.1886 7.15239 11.999 7.58336 11.6365 7.58336ZM15.917 1.75002L15.917 0.0833569L0.0836587 0.0833563L0.0836589 1.75002L15.917 1.75002Z" />
        </svg>
    );
};
