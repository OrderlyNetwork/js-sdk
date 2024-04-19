
import { FC, SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number;
}

export const TriangleDownIcon: FC<IconProps> = (props) => {
    const { size = 12, viewBox, ...rest } = props;
    return (
        <svg 
        width="10" 
        height="7" 
        viewBox="0 0 10 7" 
        fill="white" 
        fillOpacity="0.54"
        xmlns="http://www.w3.org/2000/svg"
        {...rest}
        >
            <path d="M0.738969 0.75C0.536748 0.75 0.42628 0.987321 0.555738 1.14364L4.81677 6.28865C4.91213 6.40378 5.08787 6.40378 5.18323 6.28865L9.44426 1.14364C9.57372 0.987321 9.46325 0.75 9.26103 0.75H0.738969Z"  />
        </svg>


    );
}
