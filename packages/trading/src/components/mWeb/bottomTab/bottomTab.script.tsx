import { useState } from "react";
import { useTradingPageContext } from "../../../provider/context";
import { useTradingLocalStorage } from "../../../provider/useTradingLocalStorage";
import { PositionsProps } from "@orderly.network/ui-positions";

export enum BottomTabType {
  position = "Position",
  pending = "Pending",
  tp_sl = "TP/SL",
  history = "History",
}

export const useBottomTabScript = (props: {
    symbol: string;
    config: Partial<Omit<PositionsProps, "pnlNotionalDecimalPrecision">>;
}) => {
    const { symbol, config } = props;
    // TODO: default tab should be position
  const [tab, setTab] = useState<BottomTabType>(BottomTabType.pending);
  const { tabletMediaQuery } = useTradingPageContext();
  const loalStorage = useTradingLocalStorage();


  return {
    tab,
    setTab,
    tabletMediaQuery,
    config,
    symbol,
    ...loalStorage,
  };
};

export type BottomTabState = ReturnType<typeof useBottomTabScript>;
