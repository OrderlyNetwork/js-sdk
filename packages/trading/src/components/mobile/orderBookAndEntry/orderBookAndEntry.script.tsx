import { useTradingPageContext } from "../../../provider/context";

export const useOrderBookAndEntryScript = () => {
  const { symbol } = useTradingPageContext();
  return {
    symbol,
  };
};

export type OrderBookAndEntryState = ReturnType<
  typeof useOrderBookAndEntryScript
>;
