
import { Select, cn } from "@orderly.network/react";
import { FC, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ColmunChart, 
    InitialBarStyle, 
    InitialXAxis, 
    InitialYAxis, 
    emptyDataSource, 
    emptyDataSourceYAxis 
} from "../../components/barChart";
import { useDistribution } from "../../hooks/useDistribution";
import { ReferralContext } from "../../hooks/referralContext";
import { formatYMDTime } from "../../utils/utils";
import { Decimal, commify } from "@orderly.network/utils";

type ChartDataType = "Rebate" | "Volume";

export const BarChart: FC<{ className?: string }> = (props) => {
    const [filterType, setFiltetType] = useState<ChartDataType>("Rebate");

    const [distributionData, { refresh }] = useDistribution({ size: 14 });
    const { dailyVolume, chartConfig } = useContext(ReferralContext);

    const [maxCount, setMaxCount] = useState(14);

    useEffect(() => {
      function handleResize() {
        const screenWidth = window.innerWidth;
        const newMaxCount = screenWidth > 375 ? 14 : 7; 
        setMaxCount(newMaxCount);
      }
  
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []); 

    const dataSource = useMemo(() => {


        if (filterType === "Rebate") {

            if (!distributionData || distributionData.length === 0) return [];

            let newData = distributionData.filter((item: any) => item.status === "COMPLETED" && item.type === "REFEREE_REBATE");

            if (newData.length > maxCount) {
                newData = newData.slice(0, maxCount);
            }

            return newData.map((item: any) => {
                const timeText = formatYMDTime(item.created_time);
                return [timeText, item.amount];
            });
        }

        else if (filterType === "Volume") {
            if (!dailyVolume || dailyVolume.length === 0) return [];

            const newData = dailyVolume.length > maxCount ? dailyVolume.slice(0, maxCount) : dailyVolume;

            return newData.map((item) => {
                const timeText = formatYMDTime(item.date);
                return [timeText, item.perp_volume];
            });
        } else {
            return [];
        }


    }, [distributionData, filterType]);


    const yAxis = useMemo(() => {
        if (dataSource.length === 0) {
            return emptyDataSourceYAxis();
        }
        return { ...InitialYAxis }
    }, [dataSource]);




    return (
        <div className={cn("orderly-px-6 orderly-pt-6 orderly-pb-3 orderly-outline orderly-outline-1 orderly-outline-base-600 orderly-rounded-lg orderly-flex orderly-flex-col", props.className)}>
            <div className="orderly-flex orderly-justify-between orderly-items-center">
                <div className="orderly-text-xs ">Statistic</div>
                <_FilterData curType={filterType} onClick={setFiltetType} />
            </div>

            <ColmunChart
                data={dataSource.length === 0 ? emptyDataSource(maxCount === 7) : dataSource}
                chartHover={{
                    hoverTitle: filterType,
                    title: (item) => {
                        try {
                            return commify(new Decimal(item[1]).toFixed(2, Decimal.ROUND_DOWN));
                        } catch (e) {

                        }
                        return `${item[1]}`;
                    },
                }}
                yAxis={{ ...yAxis, ...chartConfig?.trader.yAxis, }}
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



