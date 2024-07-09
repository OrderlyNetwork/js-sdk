import { useState } from "react";

export type TitleStatisticReturns = {
  period: string;
  periodTypes: { label: string; value: string }[];
  onPeriodChange: (item: string) => void;
  volType: string;
  volTypes: { label: string; value: string }[];
  onVolTypeChange: (item: string) => void;
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

  const [volType, setVolType] = useState("rebate");
  const volTypes = [
    { label: "Rebate", value: "rebate" },
    { label: "Referral vol.", value: "ref" },
  ];

  const onVolTypeChange = (item: string) => {
    setVolType(item);
  };

  return {
    period,
    periodTypes,
    onPeriodChange,
    volType,
    volTypes,
    onVolTypeChange,
  };
};
