import { useCallback } from "react";
import type { BinaryInfoRow } from "../../binary/binaryInfo";
import { binaryProtectionPrice } from "../../binary/binaryOrderRules";
import type {
  PredictionOutcome,
  PredictionOrderSide,
} from "../../prediction.types";
import type { AccountEstimates } from "./useAccountEstimates";

export interface TradingEstimatesArgs {
  accountEstimates: AccountEstimates;
  configBySymbol: Map<string, BinaryInfoRow>;
  selectedSymbol?: string;
  bbo: { bestAsk: number | undefined; bestBid: number | undefined };
  slippage: string;
}
export const useTradingEstimates = ({
  accountEstimates,
  configBySymbol,
  selectedSymbol,
  bbo,
  slippage,
}: TradingEstimatesArgs) => {
  /** Preview and submission share the live UP-book tick protection price. */
  const protectionPrice = useCallback(
    (
      outcome: PredictionOutcome,
      side: PredictionOrderSide,
      symbol = selectedSymbol,
    ) =>
      symbol === selectedSymbol
        ? binaryProtectionPrice(
            outcome,
            side,
            bbo,
            slippage,
            symbol ? configBySymbol.get(symbol) : undefined,
          )
        : undefined,
    [bbo, configBySymbol, selectedSymbol, slippage],
  );
  return { ...accountEstimates, protectionPrice };
};
export type TradingEstimates = ReturnType<typeof useTradingEstimates>;
