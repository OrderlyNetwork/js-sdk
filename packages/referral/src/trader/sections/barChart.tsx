
import { Select, cn } from "@orderly.network/react";

import { FC, useContext, useEffect, useMemo, useRef, useState } from "react";


import { ColmunChart } from "../../components/barChart";
import { useRefereeHistory } from "../../hooks/useRefereeHistory";
import { useDistribution } from "../../hooks/useDistribution";
import { ReferralContext } from "../../hooks/referralContext";
import { formatHMTime } from "../../utils/utils";

type ChartDataType = "Rebate" | "Volume";

export const BarChart: FC<{ className?: string }> = (props) => {
    const [filterType, setFiltetType] = useState<ChartDataType>("Rebate");

    const [distributionData, { refresh }] = useDistribution({ size: 30 });
    const { dailyVolume } = useContext(ReferralContext);

    console.log("referee data is", distributionData);

    const dataSource = useMemo(() => {


        if (filterType === "Rebate") {

            if (!distributionData || distributionData.length === 0) return [];

            let newData = distributionData.filter((item) => item.status === "COMPLETED" && item.type === "REFEREE_REBATE");

            if (newData.length > 7) {
                newData = newData.slice(0, 7);
            }

            return newData.map((item) => {
                const time = new Date(item.updated_time);
                const timeText = time.getMonth().toString() + "-" + time.getDay().toString();
                return [timeText, Number((item?.amount || 0).toFixed(2))];
            });
        }

        else if (filterType === "Volume") {
            if (!dailyVolume || dailyVolume.length === 0) return [];

            const newData = dailyVolume.length > 7 ? dailyVolume.slice(0,7) : dailyVolume;

            return newData.map((item) => {
                const timeText = formatHMTime(item.date);
                return [timeText, Number((item?.perp_volume || 0).toFixed(2))];
            });
        } else {
            return [];
        }


    }, [distributionData, filterType]);


    return (
        <div className={cn("orderly-p-6 orderly-outline orderly-outline-1 orderly-outline-base-600 orderly-rounded-lg", props.className)}>
            <div className="orderly-flex orderly-justify-between orderly-items-center">
                <div className="orderly-text-xs ">Statistic</div>
                <_FilterData curType={filterType} onClick={setFiltetType} />
            </div>

            <ColmunChart
                data={dataSource}
                hoverTitle={filterType}
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

    const types: ChartDataType[] = ["Rebate", "Volume"];

    return (
        <Select
            options={types.map((e) => ({ value: e, label: e }))}
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



