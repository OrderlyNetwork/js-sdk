
import { FC, SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number;
}

export const CloseIcon: FC<IconProps> = (props) => {
    const { size = 60, viewBox, ...rest } = props;
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="#394155" xmlns="http://www.w3.org/2000/svg" {...rest}>
            <g clip-path="url(#clip0_9382_81856)">
                <path d="M9 18C13.9706 18 18 13.9706 18 9C18 4.02944 13.9706 0 9 0C4.02944 0 0 4.02944 0 9C0 13.9706 4.02944 18 9 18ZM3.42564 12.9881L7.41138 9.00237L3.42564 5.01663L5.01663 3.42564L9.00237 7.41138L12.9881 3.42561L14.5791 5.0166L10.5934 9.00237L14.5791 12.9881L12.9881 14.5791L9.00237 10.5934L5.01663 14.5791L3.42564 12.9881Z" />
            </g>
            <defs>
                <clipPath id="clip0_9382_81856">
                    <rect width="18" height="18" fill="white" />
                </clipPath>
            </defs>
        </svg>



    );
}
