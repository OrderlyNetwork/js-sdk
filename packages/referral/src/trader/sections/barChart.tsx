
import { Select, cn, sub, subDays } from "@orderly.network/react";
import { FC, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
    ColmunChart,
    InitialBarStyle,
    InitialXAxis,
    InitialYAxis,
    emptyDataSourceYAxis
} from "../../components/barChart";
import { ReferralContext } from "../../hooks/referralContext";
import { generateData } from "../../utils/utils";
import { RefFilterMenu } from "../../components/refFilterMenu";
import { useRefereeRebateSummary } from "../../hooks/useRefereeRebateSummary";

type ChartDataType = "Rebate" | "Volume";

export const BarChart: FC<{ className?: string }> = (props) => {
    const [filterType, setFiltetType] = useState<ChartDataType>("Rebate");

    const {data: distributionData, mutate} = useRefereeRebateSummary({
        startDate: subDays(new Date(), 15),
        endDate: subDays(new Date(), 1),
    });
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



    const dataSource = useMemo(() => {
        if (filterType === "Rebate") {
            let newData = distributionData || [];
            return generateData(maxCount, newData, "date", "referee_rebate");
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
        <div className={cn("orderly-px-6 orderly-pt-6 orderly-pb-3 orderly-outline orderly-outline-1 orderly-outline-base-contrast-12 orderly-rounded-xl orderly-flex orderly-flex-col orderly-h-[293px]", props.className)}>
            <div className="orderly-flex orderly-justify-between orderly-items-center">
                <div className="orderly-flex-1 orderly-text-base 2xl:orderly-text-lg">Statistic</div>
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

    const { curType, onClick } = props;
    return <RefFilterMenu
        curType={`${curType}`}
        onClick={(e: any) => onClick?.(e)}
        types={["Rebate", "Volume"]}
    />;
}



