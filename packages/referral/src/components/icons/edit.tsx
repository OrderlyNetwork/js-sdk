
import { FC, SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
    
}

export const EditIcon: FC<IconProps> = (props) => {
    const {viewBox, ...rest } = props;
    return (
        <svg width="17" height="16" viewBox="0 0 17 16" fill="white" fill-opacity="0.2" xmlns="http://www.w3.org/2000/svg" {...rest} >
            <path d="M10.2497 3.66951L12.8941 6.32696L6.20021 13.0537L3.5572 10.3963L10.2497 3.66951ZM14.9008 3.02855L13.7215 1.84345C13.2658 1.38552 12.5257 1.38552 12.0683 1.84345L10.9386 2.97865L13.5831 5.63611L14.9008 4.31195C15.2542 3.95652 15.2542 3.38373 14.9008 3.02855ZM2.17339 14.1314C2.12521 14.349 2.32086 14.5441 2.53741 14.4912L5.48422 13.7732L2.84121 11.1158L2.17339 14.1314Z" />
        </svg>


    );
}
