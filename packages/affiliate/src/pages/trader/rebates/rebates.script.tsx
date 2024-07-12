import { useMemo, useState } from "react";
import { DateRange } from "../../../utils/types";
import { useRefereeRebateSummary, RefferalAPI } from "@orderly.network/hooks";
import { useReferralContext } from "../../../hooks";
import { compareDate, formatDateTimeToUTC } from "../../../utils/utils";
import { subDays } from "date-fns";

export type RebatesReturns = {
  dateRange?: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  displayDate?: string;
  dataSource: RebatesItem[] | undefined;
};

export type RebatesItem = RefferalAPI.RefereeRebateSummary & {
  vol?: number
};

export const useRebatesScript = (): RebatesReturns => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    { from: subDays(new Date(), 91), to: subDays(new Date(), 1) }
  );

  const { data: distributionData, mutate, isLoading, } = useRefereeRebateSummary({
    startDate: dateRange?.from,
    endDate: dateRange?.to,
});
const { dailyVolume } = useReferralContext();

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
    displayDate = formatDateTimeToUTC(dataSource?.[0].date);
}

  return {
    dateRange,
    setDateRange,
    displayDate,
    dataSource,
  };
};
