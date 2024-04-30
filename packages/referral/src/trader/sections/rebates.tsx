import { DatePicker, subDays, Divider, cn, sub, DateRange } from "@orderly.network/react";
import { RebateList } from "./rebateList";
import { FC, useContext, useMemo, useState } from "react";
import { ReferralContext } from "../../hooks/referralContext";
import { compareDate, formatTime } from "../../utils/utils";
import { useMediaQuery, ReferralAPI as API, useRefereeRebateSummary  } from "@orderly.network/hooks";

export type RebatesItem = API.RefereeRebateSummary & {
    vol?: number
};

export const Rebates: FC<{
    className?: string,
}> = (props) => {

    // const [displayDate, setDisplayDate] = useState<string | undefined>(undefined);
    // const [distributionData, { refresh, loadMore, isLoading }] = useDistribution({});
    const [pickDate, setPickDate] = useState<DateRange | undefined>({ from: subDays(new Date(), 91), to: subDays(new Date(), 1) });
    const { data: distributionData, mutate, isLoading, } = useRefereeRebateSummary({
        startDate: pickDate?.from,
        endDate: pickDate?.to,
    });
    const { dailyVolume } = useContext(ReferralContext);

    const dataSource = useMemo((): RebatesItem[] | undefined => {
        if (typeof distributionData === 'undefined') return [];

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
                    if (typeof date?.from === 'undefined') {
                        setPickDate(undefined);
                        return;
                    }

                    setPickDate((pre) => ({
                        from: date.from,
                        to: date.to
                    }));
                }}
                initDate={pickDate}
                triggerClassName="orderly-max-w-[196px] orderly-rounded-sm orderly-justify-between"
                numberOfMonths={isMD ? 1 : 2}
                className="orderly-ml-4 lg:orderly-flex-row"
                classNames={{
                    months: "orderly-flex orderly-flex-col lg:orderly-flex-row orderly-gap-5"
                }}
                disabled={{
                    after: subDays(new Date(), 1)
                }}
                required
            />
            <RebateList dataSource={dataSource} loadMore={() => { }} isLoading={isLoading} />
        </div>
    );
}

