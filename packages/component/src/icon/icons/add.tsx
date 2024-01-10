import { cn } from "@/utils";
import React, { FC } from "react";
import { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
    size: number;
}

export const AddIcon: FC<IconProps> = (props) => {
    const { size = 16, viewBox, fill = "none", ...rest } = props;
    return (
        <svg
            width={`${size}px`}
            height={`${size}px`}
            viewBox="0 0 14 14"
            fill="white"
            fillOpacity={0.54}
            xmlns="http://www.w3.org/2000/svg"
            {...rest}
        >
            <path d="M6 8H0V6H6V0H8V6H14V8H8V14H6V8Z" 
            />
        </svg>
    );
};
