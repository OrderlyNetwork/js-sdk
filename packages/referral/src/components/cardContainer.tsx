import { cn } from "@orderly.network/react";
import { FC, PropsWithChildren } from "react";

export const CardContainer: FC<PropsWithChildren<{ id?: string, className?: string }>> = (props) => {

    return (
        <div
            id={props.id}
            className={cn("orderly-rounded-xl", props.className)}
        >
            {props.children}
        </div>
    );
}