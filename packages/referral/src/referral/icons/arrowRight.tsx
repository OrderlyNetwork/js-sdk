import { FC, SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number;
}

export const ArrowRightIcon: FC<IconProps> = (props) => {
    const { size = 16, viewBox, ...rest } = props;
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={`${size}px`}
            height={`${size}px`}
            fill="#608CFF"
            fillOpacity={0.54}
            viewBox={`0 0 16 16`}
            {...rest}
        >
            <path
                d="M7.20208 14.0623L8.28922 15.0287L14.1074 8.48324L14.5456 8.00006L14.1074 7.51689L8.28922 0.971436L7.20208 1.93778L11.9443 7.2728L1.2002 7.2728L1.2002 8.72734L11.9443 8.72734L7.20208 14.0623Z"
                
            />
        </svg>

    );
}