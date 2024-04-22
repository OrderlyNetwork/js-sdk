import { DatePicker, format, subDays, Divider, cn, sub } from "@orderly.network/react";
import { RebateList } from "./rebateList";
import { FC, useContext, useEffect, useMemo, useState } from "react";
import { useDistribution } from "../../hooks/useDistribution";
import { ReferralContext } from "../../hooks/referralContext";
import { API } from "../../types/api";
import { compareDate, formatTime } from "../../utils/utils";
import { useRefereeRebateSummary } from "../../hooks/useRefereeRebateSummary";
import { useMediaQuery } from "@orderly.network/hooks";

export type RebatesItem = API.RefereeRebateSummary & {
    vol?: number
};

export const Rebates: FC<{
    className?: string,
}> = (props) => {

    // const [displayDate, setDisplayDate] = useState<string | undefined>(undefined);
    // const [distributionData, { refresh, loadMore, isLoading }] = useDistribution({});
    const [pickDate, setPickDate] = useState({ from: subDays(new Date(), 30), to: new Date() });
    const { data: distributionData, mutate, isLoading, } = useRefereeRebateSummary({
        startDate: pickDate.from,
        endDate: pickDate.to,
    });
    const { dailyVolume } = useContext(ReferralContext);

    const dataSource = useMemo((): RebatesItem[] | undefined => {
        if (!distributionData) return undefined;

        return distributionData
            // .filter((item: any) => item.status === "COMPLETED" && item.type === "REFEREE_REBATE")
            .map((item) => {

                const createdTime = item.date;

                const volume = dailyVolume?.filter((item) => {
                    return compareDate(new Date(createdTime), new Date(item.date));
                })?.[0];
                if (volume) {
                    return { ...item, vol: volume.perp_volume };
                }

                return item;

            });

    }, [distributionData, dailyVolume]);

    let displayDate = undefined;
    if ((dataSource?.length || 0) > 0) {
        displayDate = formatTime(dataSource?.[0].date);
    }

    const isMD = useMediaQuery("(max-width: 767px)")

    return (
        <div className={cn("orderly-py-6 orderly-px-1 orderly-rounded-xl orderly-pb-1 orderly-outline orderly-outline-1 orderly-outline-base-contrast-12", props.className)}>
            <div className="orderly-flex orderly-items-center orderly-justify-between orderly-px-2">
                <div className="orderly-flex-1 orderly-text-base 2xl:orderly-text-lg orderly-px-1 lg:orderly-px-3">My rebates</div>
                {displayDate && <div className="orderly-text-3xs orderly-text-base-contrast-36 orderly-mr-1 lg:orderly-mr-3">{displayDate}</div>}
            </div>

            <Divider className="orderly-my-3 orderly-px-3 lg:orderly-px-5" />
            <DatePicker
                onDateUpdate={(date) => {

                    setPickDate((pre) => ({
                        from: date.from,
                        to: date.to || date.from
                    }));
                }}
                initDate={pickDate}
                triggerClassName="orderly-w-[196px] orderly-rounded-sm orderly-justify-between"
                numberOfMonths={isMD ? 1 : 2}
                className="orderly-ml-4 lg:orderly-flex-row"
                classNames={{
                    months: "orderly-flex orderly-flex-col lg:orderly-flex-row orderly-gap-5"
                }}
            />
            <RebateList dataSource={dataSource} loadMore={() => { }} isLoading={isLoading} />
        </div>
    );
}

