
import { Select, cn } from "@orderly.network/react";
import { FC, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
    ColmunChart,
    InitialBarStyle,
    InitialXAxis,
    InitialYAxis,
    emptyDataSource,
    emptyDataSourceYAxis
} from "../../components/barChart";
import { useDistribution } from "../../hooks/useDistribution";
import { ReferralContext } from "../../hooks/referralContext";
import { formatYMDTime, generateData } from "../../utils/utils";
import { Decimal, commify } from "@orderly.network/utils";

type ChartDataType = "Rebate" | "Volume";

export const BarChart: FC<{ className?: string }> = (props) => {
    const [filterType, setFiltetType] = useState<ChartDataType>("Rebate");

    const [distributionData, { refresh }] = useDistribution({ size: 14 });
    const { dailyVolume, chartConfig } = useContext(ReferralContext);

    const [maxCount, setMaxCount] = useState(7);

    useEffect(() => {
        function handleResize() {
            const screenWidth = window.innerWidth;
            let newMaxCount = 7;

            if (screenWidth >= 1440) {
                newMaxCount = 14;
            }
            
            setMaxCount(newMaxCount);
        }

        handleResize();

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    console.log("xxxx setMaxCount", maxCount);
    

    const dataSource = useMemo(() => {


        if (filterType === "Rebate") {
            let newData = distributionData?.filter((item: any) => item.status === "COMPLETED" && item.type === "REFEREE_REBATE") || [];
            return generateData(maxCount, newData, "created_time", "amount");
        } else if (filterType === "Volume") {
            return generateData(maxCount, dailyVolume || [], "date", "perp_volume");
        } else {
            return generateData(maxCount, [], "date", "perp_volume");
        }


    }, [distributionData, filterType, maxCount]);


    const yAxis = useMemo(() => {
        if (dataSource.length === 0) {
            return emptyDataSourceYAxis();
        }
        return { ...InitialYAxis }
    }, [dataSource]);




    return (
        <div className={cn("orderly-px-6 orderly-pt-6 orderly-pb-3 orderly-outline orderly-outline-1 orderly-outline-base-600 orderly-rounded-xl orderly-flex orderly-flex-col", props.className)}>
            <div className="orderly-flex orderly-justify-between orderly-items-center">
                <div className="orderly-text-xs ">Statistic</div>
                <_FilterData curType={filterType} onClick={setFiltetType} />
            </div>

            <ColmunChart
                data={dataSource}
                chartHover={{
                    hoverTitle: filterType,
                }}
                yAxis={{ ...yAxis, maxRate: 1.2, ...chartConfig?.trader.yAxis, }}
                barStyle={{ ...InitialBarStyle, maxCount, ...chartConfig?.trader.bar, }}
                xAxis={{
                    ...InitialXAxis, xTitle: (item) => {
                        const list = item[0].split("-");
                        if (list.length === 3) {
                            return `${list[1]}-${list[2]}`;
                        }
                        return item[0];
                    }, ...chartConfig?.trader.bar,
                }}
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



