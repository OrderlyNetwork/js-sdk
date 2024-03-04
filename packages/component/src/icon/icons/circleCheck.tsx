import React, { FC } from "react";
import { SVGProps } from "react";

interface IconProps extends SVGProps<SVGSVGElement> {
    size: number;
}

export const CircleCheckIcon: FC<IconProps> = (props) => {
    const { size = 20, ...rest } = props;

    return (
        <svg
            width={`${size}px`}
            height={`${size}px`}
            viewBox="0 0 20 20"
            fill="white"
            fillOpacity={0.98}
            xmlns="http://www.w3.org/2000/svg"
            {...rest}
        >
            <path d="M10 20.6268C15.5228 20.6268 20 16.1497 20 10.6268C20 5.10398 15.5228 0.626831 10 0.626831C4.47715 0.626831 0 5.10398 0 10.6268C0 16.1497 4.47715 20.6268 10 20.6268ZM8.38388 15.9837L3.125 10.7248L4.89277 8.95705L8.38388 12.4482L15.2053 5.62683L16.973 7.3946L8.38388 15.9837Z"/>
        </svg>
    );
};
