import { usePositionStream } from "@orderly.network/hooks";
import { useDataTap } from "@orderly.network/react-app";
import { useMemo } from "react";
import { useTradingLocalStorage } from "../../../provider/useTradingLocalStorage";

export const usePositionHeaderScript = (props: {
  pnlNotionalDecimalPrecision?: number;
  unPnlPriceBasis: "markPrice" | "lastPrice";
  symbol?: string;
}) => {
  const {
    pnlNotionalDecimalPrecision,
    unPnlPriceBasis,
    symbol,
  } = props;
  const calcMode = unPnlPriceBasis;

  const [data] = usePositionStream(symbol, {
    calcMode,
  });
  const aggregated = useDataTap(data.aggregated);

  const unrealPnL = aggregated?.total_unreal_pnl;
  const unrealPnlROI = aggregated?.unrealPnlROI;
  const notional = aggregated?.notional;
  const { showAllSymbol, setShowAllSymbol } = useTradingLocalStorage();

  return {
    pnlNotionalDecimalPrecision,
    unrealPnL,
    unrealPnlROI,
    notional,
    showAllSymbol,
    setShowAllSymbol,
  };
};

export type PositionHeaderState = ReturnType<typeof usePositionHeaderScript>;
