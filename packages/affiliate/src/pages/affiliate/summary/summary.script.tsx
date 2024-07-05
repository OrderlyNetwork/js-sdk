import { useState } from "react";

export type SummaryReturns = {
  period: string;
  periodTypes: {label: string, value: string}[];
  onPeriodChange: (item: string) => void;
};

export const useSummaryScript = (): SummaryReturns => {
  const [period, setPeriod] = useState("7");
  const periodTypes = [
    { label: "7D", value: '7' },
    { label: "30D", value: '30' },
    { label: "90D", value: '90' },
  ];

  const onPeriodChange = (item: string) => {
    setPeriod(item);
  };

  return {
    period,
    periodTypes,
    onPeriodChange,
  };
};
