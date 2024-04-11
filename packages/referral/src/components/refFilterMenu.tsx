import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Numeral, Select, cn } from "@orderly.network/react";
import { TriangleDownIcon } from "../affiliate/icons";
import { FC, useEffect, useState } from "react";
import React from "react";



export const RefFilterMenu: FC<{
    curType: string,
    types: string[],
    
    onClick?: (type: string) => void,
}> = (props) => {

    const [open, setOpen] = useState(false);
    const [width, setWidth] = useState(0);
    const { curType, onClick, types } = props;

    const triggerRef = React.useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (triggerRef.current) {
            setWidth(triggerRef.current.offsetWidth);
        }
    }, []);

    return (<DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
        <DropdownMenuTrigger >
            <div
                ref={triggerRef}
                className="orderly-flex orderly-items-center orderly-justify-between orderly-gap-2 orderly-px-2 orderly-py-[6px] orderly-bg-base-500 orderly-outline orderly-outline-1 orderly-outline-base-400 orderly-rounded-md orderly-h-[24px] orderly-text-2xs orderly-text-base-contrast-80"
            >
                <span>{curType}</span>
                <TriangleDownIcon className={cn("orderly-transform", open && "orderly-rotate-180")}/>
            </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
            className="!orderly-bg-base-800 orderly-px-0 orderly-pt-2"
            align="start"
            style={{ minWidth: `${width}px` }}
            onCloseAutoFocus={(e) => e.preventDefault()}
        >
            {types.map((item, index) => {
                return (
                    <DropdownMenuItem
                        key={index}
                        className={cn("orderly-cursor-pointer orderly-text-base-contrast/60 hover:orderly-bg-base-600 orderly-text-3xs desktop:orderly-text-2xs orderly-h-[24px]", curType === item && "orderly-text-base-contrast")}
                        onSelect={(event) => {
                            onClick?.(item);
                        }}
                    >
                        {item}
                    </DropdownMenuItem>
                );
            })}
        </DropdownMenuContent>
    </DropdownMenu>);
}