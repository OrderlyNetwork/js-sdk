import { useLocalStorage } from "@orderly.network/hooks";
import { useTradingPageContext } from "../../../provider/tradingPageContext";

const ORDERLY_MWEB_ORDER_ENTRY_SIDE_MARKETS_LAYOUT =
  "orderly_mweb_order_entry_side_markets_layout";

export type OrderBookAndEntryLayout = "left" | "right";

export const useOrderBookAndEntryScript = () => {
  const { symbol } = useTradingPageContext();
  const [layout] = useLocalStorage<OrderBookAndEntryLayout>(
    ORDERLY_MWEB_ORDER_ENTRY_SIDE_MARKETS_LAYOUT,
    "right",
  );
  return {
    symbol,
    layout,
  };
};

export type OrderBookAndEntryState = ReturnType<
  typeof useOrderBookAndEntryScript
>;
