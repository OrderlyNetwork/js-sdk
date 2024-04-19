
import React from "react";
import { FC, SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number;
}

export const PinIcon: FC<IconProps> = (props) => {
    const { size = 16, viewBox, ...rest } = props;
    return (
        <svg
            width={`${size}`}
            height={`${size}`}
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            fill="white" fillOpacity="0.36"
            {...rest}
        >
            <path d="M5.2998 3.8V2.33333H4.63314V1H11.2998V2.33333H10.6331V7.66667L11.9665 9V10.3333H11.8331L9.2998 7.8V2.33333H6.63314V5.13333L5.2998 3.8ZM13.2998 13.4667L12.4331 14.3333L8.4998 10.4V14.3333H7.43314V10.3333H3.96647V9L5.2998 7.66667V7.2L1.2998 3.2L2.16647 2.33333L13.2998 13.4667ZM5.83314 9H7.03314L6.43314 8.4L5.83314 9Z" />
        </svg>

    );
}



export const UnPinIcon: FC<IconProps> = (props) => {
    const { size = 16, viewBox, ...rest } = props;
    return (
        <svg
            width={`${size}`}
            height={`${size}`}
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            fill="#608CFF"
            {...rest}
        >
           <path d="M10.6667 7.66667V2.33333H11.3333V1H4.66667V2.33333H5.33333V7.66667L4 9V10.3333H7.46667V14.3333H8.53333V10.3333H12V9L10.6667 7.66667Z" />
        </svg>

    );
}
