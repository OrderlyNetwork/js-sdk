import { usePositionStream } from "@orderly.network/hooks";
import { useDataTap } from "@orderly.network/react-app";
import { useTradingLocalStorage } from "../../../hooks";

export const usePositionHeaderScript = (inputs: {
  pnlNotionalDecimalPrecision?: number;
  unPnlPriceBasis: "markPrice" | "lastPrice";
  symbol?: string;
}) => {
  const { pnlNotionalDecimalPrecision, unPnlPriceBasis, symbol } = inputs;
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
    symbol,
  };
};

export type PositionHeaderState = ReturnType<typeof usePositionHeaderScript>;
