import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Numeral, Select, cn } from "@orderly.network/react";
import { HistoryIcon, TriangleDownIcon } from "../affiliate/icons";
import { FC, useEffect, useState } from "react";
import { FilterType } from "../types/types";
import React from "react";



export const SummaryFilter: FC<{
    curType: FilterType,
    onClick?: (type: FilterType) => void,
}> = (props) => {

    const [open, setOpen] = useState(false);
    const [width, setWidth] = useState(0);
    const { curType, onClick } = props;
    const types: FilterType[] = ["1D", "7D", "30D", "All"];

    const triggerRef = React.useRef<HTMLButtonElement | null>(null);
    useEffect(() => {
        if (triggerRef.current) {
            setWidth(triggerRef.current.offsetWidth);
        }
    }, []);

    return (<DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
        <DropdownMenuTrigger >
            <button
                ref={triggerRef}
                className="orderly-flex orderly-items-center orderly-justify-between orderly-gap-2 orderly-px-2 orderly-py-[6px] orderly-bg-base-400 orderly-rounded-md orderly-h-[24px] orderly-text-2xs"
            >
                <HistoryIcon />
                <span>{curType}</span>
                <TriangleDownIcon />
            </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
            className="orderly-bg-base-800 orderly-px-0"
            // onFocusCapture={(e) => e.preventDefault()}
            align="start"
            style={{ minWidth: `${width}px` }}
            onCloseAutoFocus={(e) => e.preventDefault()}
        >
            {types.map((item, index) => {
                return (
                    <DropdownMenuItem
                        key={index}
                        className={cn("orderly-text-base-contrast/60 hover:orderly-bg-base-700 orderly-text-3xs desktop:orderly-text-2xs", curType === item && "orderly-text-base-contrast")}
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

    // return (

    //     <div className="orderly-flex orderly-items-center orderly-h-[24px] orderly-bg-base-300 orderly-px-2 orderly-rounded-sm">
    //         <HistoryIcon />
    //         <Select
    //             options={types.map((e) => ({ value: e, label: e }))}
    //             fullWidth
    //             // size={"small"}
    //             value={curType}
    //             className="orderly-text-4xs orderly-text-base-contrast-54 orderly-ml-2 orderly-h-[24px] orderly-px-0 orderly-bg-trasparent"
    //             contentClassName="orderly-bg-base-500 orderly-px-0 "
    //             onChange={(value: any) => {
    //                 props.onClick?.(value);
    //             }}
    //             color={"default"}
    //         />
    //     </div>

    // );
}