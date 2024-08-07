import { useMemo, useState } from "react";
import {
  useCollateral,
  useLocalStorage,
  useStatisticsDaily,
} from "@orderly.network/hooks";
import { subDays, format } from "date-fns";
import { API } from "@orderly.network/types";
import { useDataTap } from "@orderly.network/react-app";

export enum PeriodType {
  WEEK = "7D",
  MONTH = "30D",
  QUARTER = "90D",
}

export const useAssetsHistoryData = (
  localKey: string,
  options?: {
    isRealtime?: boolean;
  }
) => {
  const { isRealtime = false } = options || {};
  const periodTypes = Object.values(PeriodType);
  const [period, setPeriod] = useLocalStorage<PeriodType>(
    // "portfolio_performance_period",
    localKey,
    PeriodType.WEEK
  );

  const { totalValue } = useCollateral();

  const getStartDate = (value: PeriodType) => {
    switch (value) {
      case PeriodType.MONTH:
        return subDays(new Date(), isRealtime ? 29 : 30);

      case PeriodType.QUARTER:
        return subDays(new Date(), isRealtime ? 89 : 90);
      default:
        return subDays(new Date(), isRealtime ? 6 : 7);
    }
  };

  const [startDate, setStartDate] = useState(getStartDate(period));

  const [data, { aggregateValue }] = useStatisticsDaily({
    startDate: startDate.toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const onPeriodChange = (value: PeriodType) => {
    setStartDate(getStartDate(value));
    setPeriod(value);
  };

  // console.log("-------", totalValue, data);

  const calculateData = (data: API.DailyRow[], isRealTime: boolean) => {
    return !isRealtime
      ? data
      : Array.isArray(data) && data.length > 0
      ? data.concat([
          //@ts-ignore
          {
            date: format(new Date(), "yyyy-MM-dd"),
            account_value: !!totalValue
              ? totalValue
              : data[data.length - 1]?.account_value ?? 0,
          },
        ])
      : data;
  };

  // const filteredData = useDataTap(calculateData(data, isRealtime), {
  //   fallbackData: [data[0], data[data.length - 1]],
  // });

  return {
    periodTypes,
    period,
    onPeriodChange,
    data: calculateData(data, isRealtime),
    aggregateValue,
    volumeUpdateDate: data?.[data.length - 1]?.date ?? "",
  } as const;
};

export type useAssetsHistoryDataReturn = ReturnType<
  typeof useAssetsHistoryData
>;
