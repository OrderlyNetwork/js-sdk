import { useState } from "react";
import { useTradingPageContext } from "../../../provider/context";
import { useTradingLocalStorage } from "../../../provider/useTradingLocalStorage";
import { PositionsProps } from "@orderly.network/ui-positions";
import { usePositionsCount } from "../../../provider/usePositionsCount";
import { usePendingOrderCount } from "../../../provider/usePendingOrderCount";

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

  const { positionCount } = usePositionsCount(symbol);
  const { pendingOrderCount, tpSlOrderCount } = usePendingOrderCount(symbol);

  return {
    tab,
    setTab,
    tabletMediaQuery,
    config,
    symbol,
    positionCount,
    pendingOrderCount,
    tpSlOrderCount,
    ...loalStorage,
  };
};

export type BottomTabState = ReturnType<typeof useBottomTabScript>;
