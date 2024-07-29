import { useRefereeRebateSummary } from "@orderly.network/hooks";
import { format, subDays } from "date-fns";
import { useMemo, useState } from "react";
import { useReferralContext } from "../../../hooks";
import { BarDayFilter } from "../../../utils/types";
import { VolChartDataItem } from "@orderly.network/chart";
import { fillData } from "../../../utils/chartUtils";

export type TitleStatisticReturns = {
  period: string;
  periodTypes: { label: string; value: string }[];
  onPeriodChange: (item: string) => void;
  volType: string;
  volTypes: { label: string; value: string }[];
  onVolTypeChange: (item: string) => void;
  dataSource: VolChartDataItem[];
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
    startDate?: Date;
    endDate?: Date;
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
    if (volType === "rebate") {
      let newData = distributionData || [];
      return newData
        .map((e) => ({
          date: e.date,
          volume: e.referee_rebate,
        }))
        .reverse();
    } else if (volType === "volume") {
      return (
        dailyVolume
          ?.filter((e) => {
            return (
              e.date > format(subDays(Date(), Number(period) + 1), "yyyy-MM-dd")
            );
          })
          .map((e) => ({
            date: e.date,
            volume: e.perp_volume,
          })) || []
      );
    } else {
      return [];
    }
  }, [distributionData, dailyVolume, volType]);

  console.log("datasouce", distributionData, dailyVolume, volType, dataSource);

  return {
    period,
    periodTypes,
    onPeriodChange,
    volType,
    volTypes,
    onVolTypeChange,
    dataSource: fillData(Number(period),dataSource),
  };
};
