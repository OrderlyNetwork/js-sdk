import { useTradingPageContext } from "../../../provider/tradingPageContext";

export const useOrderBookAndEntryScript = () => {
  const { symbol } = useTradingPageContext();
  return {
    symbol,
  };
};

export type OrderBookAndEntryState = ReturnType<
  typeof useOrderBookAndEntryScript
>;
