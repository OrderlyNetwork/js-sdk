
import { Select, cn } from "@orderly.network/react";
import { FC, useContext,  useMemo, useState } from "react";
import { ColmunChart, InitialBarStyle, InitialXAxis, InitialYAxis, emptyDataSource, emptyDataSourceYAxis } from "../../components/barChart";
import { useRefereeHistory } from "../../hooks/useRefereeHistory";
import { formatMdTime } from "../../utils/utils";
import { ReferralContext } from "../../hooks/referralContext";

type ChartDataType = "Commission" | "Referral vol.";

export const BarChart: FC<{ className?: string }> = (props) => {
    const [filterType, setFiltetType] = useState<ChartDataType>("Commission");

    const [data, { refresh }] = useRefereeHistory({ size: 7 });

    const { chartConfig } = useContext(ReferralContext);

    const dataSource = useMemo(() => {

        // @ts-ignore
        if ((data?.length || 0) === 0) return [];


        const end = Math.min(7, data.length);

        // @ts-ignore
        return data.slice(0, end).map((item) => {


            const timeText = formatMdTime(item.date);
            if (filterType === "Commission") {
                return [timeText, item?.referee_rebate || 0];
            }
            return [timeText, item?.volume || 0];

        }).reverse();

    }, [data, filterType]);

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
                data={dataSource.length === 0 ? emptyDataSource(true) : dataSource}
                hoverTitle={filterType}
                yAxis={{ ...chartConfig?.yAxis, ...yAxis }}
                barStyle={{ ...chartConfig?.bar, ...InitialBarStyle }}
                xAxis={{ ...chartConfig?.bar, ...InitialXAxis }}

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



