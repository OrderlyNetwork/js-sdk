
import { FC, SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number;
}

export const HintIcon: FC<IconProps> = (props) => {
    const { size = 12, viewBox, ...rest } = props;
    return (
        <svg
            width={`${size}`}
            height={`${size}`}
            viewBox="0 0 12 12"
            xmlns="http://www.w3.org/2000/svg"
            fill="white"
            fill-opacity="0.36"
            {...rest}
        >
            <path d="M0 6C0 2.68629 2.68629 0 6 0C9.31371 0 12 2.68629 12 6C12 9.31371 9.31371 12 6 12C2.68629 12 0 9.31371 0 6ZM6.71428 3.75V2.32141H5.28571V3.75H6.71428ZM6.65625 4.875H5.34375V9.75H6.65625V4.875Z"/>
        </svg>

    );
}


/*
<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0 6C0 2.68629 2.68629 0 6 0C9.31371 0 12 2.68629 12 6C12 9.31371 9.31371 12 6 12C2.68629 12 0 9.31371 0 6ZM6.71428 3.75V2.32141H5.28571V3.75H6.71428ZM6.65625 4.875H5.34375V9.75H6.65625V4.875Z" fill="white" fill-opacity="0.36"/>
</svg>

*/