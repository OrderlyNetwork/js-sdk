import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, Numeral, Select, cn } from "@orderly.network/react";
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

        <Select
            options={types.map((e) => ({ value: e, label: e }))}
            fullWidth
            // size={"small"}
            value={curType}
            className="orderly-text-4xs orderly-text-base-contrast-54 orderly-w-[103px]"
            contentClassName="orderly-bg-base-800 orderly-px-0"
            onChange={(value: any) => {
                props.onClick?.(value);
            }}
            color={"default"}
        />

    );
}