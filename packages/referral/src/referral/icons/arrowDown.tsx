import { FC, SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number;
}

export const ArrorDownIcon: FC<IconProps> = (props) => {
    const { size = 16, viewBox, ...rest } = props;
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={`${size}px`}
            height={`${size}px`}
            fill="#608CFF"
            fillOpacity={1}
            viewBox={`0 0 16 16`}
            {...rest}
        >
            <g clip-path="url(#clip0_8507_104242)">
                <path d="M1.93744 7.20208L0.971063 8.28922L7.51652 14.1074L7.99969 14.5456L8.48287 14.1074L15.0283 8.28922L14.062 7.20208L8.72696 11.9443L8.72696 1.2002L7.27241 1.2002L7.27241 11.9443L1.93744 7.20208Z"  />
            </g>
            <defs>
                <clipPath id="clip0_8507_104242">
                    <rect width="16" height="16" transform="translate(16) rotate(90)" />
                </clipPath>
            </defs>
        </svg>

    );
}