import { useRefereeRebateSummary } from "@orderly.network/hooks";
import { subDays } from "date-fns";
import { useMemo, useState } from "react";
import { useReferralContext } from "../../../hooks";
import { BarDayFilter } from "../../../utils/types";

export type TitleStatisticReturns = {
  period: string;
  periodTypes: { label: string; value: string }[];
  onPeriodChange: (item: string) => void;
  volType: string;
  volTypes: { label: string; value: string }[];
  onVolTypeChange: (item: string) => void;
};

export const useTitleStatisticScript = (): TitleStatisticReturns => {
  const [period, setPeriod] = useState<BarDayFilter>("7");
  const periodTypes = [
    { label: "7D", value: "7" },
    { label: "30D", value: "30" },
    { label: "90D", value: "90" },
  ];

  const onPeriodChange = (item: string) => {
    setPeriod(item as BarDayFilter);
  };

  const [volType, setVolType] = useState("rebate");
  const volTypes = [
    { label: "Rebate", value: "rebate" },
    { label: "Volume", value: "volume" },
  ];

  const onVolTypeChange = (item: string) => {
    setVolType(item);
  };

  const dateRange = useMemo((): {
    startDate?: Date,
    endDate?: Date,
  } => {
    if (period === "7") {
      return {
        startDate: subDays(new Date(), 8),
        endDate: subDays(new Date(), 1),
      };
    } else if (period === "30") {
      return {
        startDate: subDays(new Date(), 31),
        endDate: subDays(new Date(), 1),
      };
    } else if (period === "90") {
      return {
        startDate: subDays(new Date(), 91),
        endDate: subDays(new Date(), 1),
      };
    } else {
      return {
        startDate: undefined,
        endDate: undefined,
      };
    }
  }, [period]);

  const { data: distributionData, mutate } = useRefereeRebateSummary(dateRange);
  const { dailyVolume, chartConfig } = useReferralContext();

  const dataSource = useMemo(() => {
    if (volType === "Rebate") {
        let newData = distributionData || [];
        return newData.map((e) => ({
          "date": e.date,
          "referee_rabate": e.referee_rebate,
        }));
        // return generateData(maxCount, newData, "date", "referee_rebate");
    } else if (volType === "Volume") {
      return dailyVolume?.map((e) => ({
        "date": e.date,
        "perp_volume": e.perp_volume,
      }));
        // return generateData(maxCount, dailyVolume || [], "date", "perp_volume");
    } else {
        return undefined;
    }
}, [distributionData, volType]);

  return {
    period,
    periodTypes,
    onPeriodChange,
    volType,
    volTypes,
    onVolTypeChange,
  };
};
