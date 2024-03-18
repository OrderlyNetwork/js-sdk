
import { Select, cn } from "@orderly.network/react";

import { FC, useEffect, useMemo, useRef, useState } from "react";

import { TriangleDownIcon } from "../icons";
import { ColmunChart } from "../../components/barChart";
import { useReferee } from "../../hooks/useReferee";

type ChartDataType = "Commission" | "Referral vol.";

export const BarChart: FC<{ className?: string }> = (props) => {
    const [filterType, setFiltetType] = useState<ChartDataType>("Commission");

    const {data} = useReferee();

    console.log("referee data is", data);

    const dataSource = useMemo(() => {
        // @ts-ignore
        if ((data?.length || 0) === 0) return [];

        

        // @ts-ignore
        return data.slice(0,7).map((item) => {

            const time = new Date(item.date);
            const timeText = time.getMonth().toString() + "-"+ time.getDay().toString();
            if (filterType === "Commission") {
                return [timeText, item?.referee_rebate || 0];
            }
            return [timeText, item?.volumn || 0];

        });

    }, [data, filterType]);
    

    return (
        <div className={cn("orderly-p-6 orderly-outline orderly-outline-1 orderly-outline-base-600 orderly-rounded-lg", props.className)}>
            <div className="orderly-flex orderly-justify-between orderly-items-center">
                <div className="orderly-text-xs orderly-text-base-contrast-36">USDC</div>
                <_FilterData curType={filterType} onClick={setFiltetType} />
            </div>

            <ColmunChart data={dataSource}
            />
        </div>
    );
}

const _FilterData: FC<{
    curType: ChartDataType,
    onClick?: (type: ChartDataType) => void,
}> = (props) => {

    const [open, setOpen] = useState(false);
    const { curType, onClick } = props;

    const types: ChartDataType[] = ["Commission", "Referral vol."];

    return (
        <Select
        options={types.map((e) => ({value: e, label: e}))}
        fullWidth
        // size={"small"}
        value={curType}
        className="orderly-text-4xs orderly-text-base-contrast-54 orderly-w-[103px] orderly-bg-base-700"
        contentClassName="orderly-bg-base-800 orderly-px-0"
        onChange={(value: any) => {
          props.onClick?.(value);
        }}
        color={"default"}
      />
    );
}



