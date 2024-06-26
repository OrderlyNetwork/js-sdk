
import { cn, format, subDays } from "@orderly.network/react";
import { FC, useContext, useMemo, useState } from "react";
import { ColmunChart, InitialBarStyle, InitialXAxis, InitialYAxis, emptyDataSource, emptyDataSourceYAxis } from "../../components/barChart";
import { ReferralContext } from "../../hooks/referralContext";
import { RefFilterMenu } from "../../components/refFilterMenu";
import { generateData } from "../../utils/utils";
import { useReferralRebateSummary } from "@orderly.network/hooks";

type ChartDataType = "Commission" | "Referral vol.";

export const BarChart: FC<{ className?: string }> = (props) => {
    const [filterType, setFiltetType] = useState<ChartDataType>("Commission");

    const [ rebateSummary] = useReferralRebateSummary({
        startDate: format(subDays(new Date(), 15), 'yyyy-MM-dd'),
        endDate: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    });

    const { chartConfig } = useContext(ReferralContext);

    const dataSource = useMemo(() => {
        // return generateData(7, data, "date", filterType === "Commission" ? "referee_rebate" : "volume");
        
        return generateData(7, rebateSummary, "date", filterType === "Commission" ? "referral_rebate" : "volume");
    }, [rebateSummary, filterType]);

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
                data={dataSource.length === 0 ? emptyDataSource(true) : dataSource}
                chartHover={{
                    hoverTitle: filterType,
                }}
                yAxis={{ ...yAxis, maxRate: 1.2, ...chartConfig?.affiliate.yAxis, }}
                barStyle={{ ...InitialBarStyle, maxCount: 7, ...chartConfig?.affiliate.bar, }}
                xAxis={{
                    ...InitialXAxis, xTitle: (item) => {
                        const list = item[0].split("-");
                        if (list.length === 3) {
                            return `${list[1]}-${list[2]}`;
                        }
                        return item[0];
                    }, ...chartConfig?.affiliate.bar,
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
        types={["Commission", "Referral vol."]}
    />;

}



