import { useState } from "react";
import { useLocalStorage, useStatisticsDaily } from "@orderly.network/hooks";
import { subDays } from "date-fns";

export enum PeriodType {
  WEEK = "7D",
  MONTH = "30D",
  QUARTER = "90D",
}

export const useAssetsHistoryData = (localKey: string) => {
  const periodTypes = Object.values(PeriodType);
  const [period, setPeriod] = useLocalStorage<PeriodType>(
    // "portfolio_performance_period",
    localKey,
    PeriodType.WEEK
  );
  const getStartDate = (value: PeriodType) => {
    switch (value) {
      case PeriodType.MONTH:
        return subDays(new Date(), 30);

      case PeriodType.QUARTER:
        return subDays(new Date(), 90);
      default:
        return subDays(new Date(), 7);
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

  return {
    periodTypes,
    period,
    onPeriodChange,
    data,
    aggregateValue,
  } as const;
};

export type useAssetsHistoryDataReturn = ReturnType<
  typeof useAssetsHistoryData
>;
