import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, Numeral, cn } from "@orderly.network/react";
import { HistoryIcon, TriangleDownIcon } from "../icons";
import { FC, useState } from "react";
import { FilterType } from "./summary";


export const SummaryFilter: FC<{
    curType: FilterType,
    onClick?: (type: FilterType) => void,
}> = (props) => {

    const [open, setOpen] = useState(false);
    const { curType, onClick } = props;
    const types: FilterType[] = ["All", "1D", "7D", "30D"];

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger>
                <button className="orderly-flex orderly-items-center orderly-justify-between orderly-gap-2 orderly-px-2 orderly-py-[6px]">
                    <HistoryIcon />
                    <span>{curType}</span>
                    <TriangleDownIcon />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="orderly-w-[72px] orderly-my-3 orderly-px-0">
                {types.map((item) => (<button
                    onClick={(e) => {
                        onClick?.(item);
                        setOpen(false);
                    }}
                    className={cn("orderly-h-[24px] orderly-block orderly-w-full orderly-text-left orderly-px-3 orderly-text-3xs orderly-text-base-contrast-54 hover:orderly-bg-base-200", item === curType && "orderly-text-base-contrast-80")}
                >
                    {item}
                </button>))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}