import { useState } from "react";
import { useTradingPageContext } from "../../../provider/context";


export enum TopTabType {
  chart = "chart",
  trades = "trades",
  data = "data",
}

export const useTopTabScript = () => {
  const [tab, setTab] = useState<TopTabType>(TopTabType.chart);
  const { symbol } = useTradingPageContext();

  return {
    tab,
    setTab,
    symbol,
  };
};

export type TopTabState = ReturnType<typeof useTopTabScript>;
