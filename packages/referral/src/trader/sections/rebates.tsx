import { Divider, cn } from "@orderly.network/react";
import { RebateList } from "./rebateList";
import { FC, useContext, useMemo, useState } from "react";
import { useDistribution } from "../../hooks/useDistribution";
import { ReferralContext } from "../../hooks/referralContext";
import { API } from "../../types/api";
import { compareDate, formatTime } from "../../utils/utils";

export type RebatesItem = API.Distribution & {
    vol?: number
};

export const Rebates: FC<{
    className?: string,
}> = (props) => {

    // const [displayDate, setDisplayDate] = useState<string | undefined>(undefined);
    const [distributionData, { refresh, loadMore, isLoading }] = useDistribution({});
    const { dailyVolume } = useContext(ReferralContext);

    const dataSource = useMemo((): RebatesItem[] | undefined => {
        if (!distributionData) return undefined;

        return distributionData
        .filter((item: any) => item.status === "COMPLETED" && item.type === "REFEREE_REBATE")
        .map((item: any) => {

            const createdTime = item.created_time;

            const volume = dailyVolume?.filter((item) => {
                return compareDate(new Date(createdTime), new Date(item.date));
            })?.[0];
            if (volume) {
                return {...item, vol: volume.perp_volume};
            }

            return item;

        });

    }, [distributionData, dailyVolume]);

    let displayDate = undefined;
    if ((dataSource?.length || 0) > 0) {
        displayDate = formatTime(dataSource?.[0].created_time);
    }

    return (
        <div className={cn("orderly-p-3 orderly-rounded-lg orderly-pb-1 orderly-outline orderly-outline-1 orderly-outline-base-600", props.className)}>
            <div className="orderly-flex orderly-items-center orderly-justify-between">
                <div className="orderly-flex-1 orderly-text-base 2xl:orderly-text-lg">My rebates</div>
                {displayDate && <div className="orderly-text-3xs orderly-text-base-contrast-36">{displayDate}</div>}
            </div>

            <Divider className="orderly-mt-3" />
            <RebateList dataSource={dataSource} loadMore={loadMore} isLoading={isLoading}/>
        </div>
    );
}

