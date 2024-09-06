import { usePositionStream } from "@orderly.network/hooks";
import { useDataTap } from "@orderly.network/react-app";
import { useMemo } from "react";

export const usePositionHeaderScript = (props: {
  pnlNotionalDecimalPrecision?: number;
  unPnlPriceBasis: "markPrice" | "lastPrice";
  symbol?: string;
}) => {
  const { pnlNotionalDecimalPrecision, unPnlPriceBasis, symbol } = props;
  const calcMode = unPnlPriceBasis;

  const [data] = usePositionStream(symbol, {
    calcMode,
  });
  const aggregated = useDataTap(data.aggregated);
  const unrealPnL = aggregated?.unrealPnL;
  const unrealPnlROI = aggregated?.unrealPnlROI;
  const notional = aggregated?.notional;
  return {
    pnlNotionalDecimalPrecision,
    unrealPnL,
    unrealPnlROI,
    notional,
  };
};

export type PositionHeaderState = ReturnType<typeof usePositionHeaderScript>;