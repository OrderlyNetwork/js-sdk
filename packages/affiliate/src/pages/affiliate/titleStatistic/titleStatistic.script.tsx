import { RefferalAPI, useReferralRebateSummary } from "@orderly.network/hooks";
import { format, subDays } from "date-fns";
import { useMemo, useState } from "react";

export type TitleStatisticReturns = {
  period: string;
  periodTypes: { label: string; value: string }[];
  onPeriodChange: (item: string) => void;
  volType: string;
  volTypes: { label: string; value: string }[];
  onVolTypeChange: (item: string) => void;
  dataSource?: {
    date: string;
    vol: number;
  }[];
};

export const useTitleStatisticScript = (): TitleStatisticReturns => {
  const [period, setPeriod] = useState("7");
  const periodTypes = [
    { label: "7D", value: "7" },
    { label: "30D", value: "30" },
    { label: "90D", value: "90" },
  ];

  const onPeriodChange = (item: string) => {
    setPeriod(item);
  };

  const [volType, setVolType] = useState("Commission");
  const volTypes = [
    { label: "Commission", value: "Commission" },
    { label: "Referral vol.", value: "ref" },
  ];

  const onVolTypeChange = (item: string) => {
    setVolType(item);
  };

  const dateRange = useMemo((): {
    startDate: Date;
    endDate: Date;
  } => {
    if (period === "30") {
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
        startDate: subDays(new Date(), 8),
        endDate: subDays(new Date(), 1),
      };
    }
  }, [period]);

  const [rebateSummary] = useReferralRebateSummary({
    startDate: format(dateRange.startDate, "yyyy-MM-dd"),
    endDate: format(dateRange.endDate, "yyyy-MM-dd"),
  });

  const dataSource = useMemo(() => {
    return (rebateSummary as RefferalAPI.ReferralRebateSummary[] | null)?.map(
      (e) => ({
        date: e.date,
        vol: period === "Commssion" ? e.referral_rebate : e.volume,
      })
    );
  }, [rebateSummary, period]);

  return {
    period,
    periodTypes,
    onPeriodChange,
    volType,
    volTypes,
    onVolTypeChange,
    dataSource,
  };
};