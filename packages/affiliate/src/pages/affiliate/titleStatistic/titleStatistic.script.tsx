import { RefferalAPI, useReferralRebateSummary } from "@orderly.network/hooks";
import { format, subDays } from "date-fns";
import { useMemo, useState } from "react";
import { fillData } from "../../../utils/chartUtils";

export type TitleStatisticReturns = {
  period: string;
  periodTypes: { label: string; value: string }[];
  onPeriodChange: (item: string) => void;
  volType: string;
  volTypes: { label: string; value: string }[];
  onVolTypeChange: (item: string) => void;
  dataSource?: {
    date: string;
    volume: number;
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
    if (period === "7") {
      return {
        startDate: subDays(new Date(), 7),
        endDate: subDays(new Date(), 1),
      };
    } else if (period === "30") {
      return {
        startDate: subDays(new Date(), 30),
        endDate: subDays(new Date(), 1),
      };
    } else if (period === "90") {
      return {
        startDate: subDays(new Date(), 90),
        endDate: subDays(new Date(), 1),
      };
    } else {
      return {
        startDate: subDays(new Date(), 7),
        endDate: subDays(new Date(), 1),
      };
    }
  }, [period]);

  const [rebateSummary] = useReferralRebateSummary({
    startDate: format(dateRange.startDate, "yyyy-MM-dd"),
    endDate: format(dateRange.endDate, "yyyy-MM-dd"),
    size: Number(period),
  });

  const dataSource = useMemo(() => {
    return ((rebateSummary as RefferalAPI.ReferralRebateSummary[] | null)?.map(
      (e) => ({
        date: e.date,
        volume: volType === "Commission" ? e.referral_rebate : e.volume,
      })
    ) || []).reverse();
  }, [rebateSummary, volType  ]);
 
  console.log("dataSource", dateRange, volType, rebateSummary?.[0], dataSource?.[0]);
  

  return {
    period,
    periodTypes,
    onPeriodChange,
    volType,
    volTypes,
    onVolTypeChange,
    dataSource: fillData(Number(period), dataSource),
  };
};
