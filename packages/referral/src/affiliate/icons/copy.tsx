
import React from "react";
import { FC, SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number;
}

export const CopyIcon: FC<IconProps> = (props) => {
    const { size = 16, viewBox, ...rest } = props;
    return (
        <svg
            width={`${size}`}
            height={`${size}`}
            viewBox="0 0 12 12"
            xmlns="http://www.w3.org/2000/svg"
            fill="white"
            fillOpacity="0.54"
            {...rest}
        >
            <path d="M3 11V3H11V1H1V11H3Z"/>
            <path d="M5 5H15V15H5V5Z"/>
        </svg>

    );
}
