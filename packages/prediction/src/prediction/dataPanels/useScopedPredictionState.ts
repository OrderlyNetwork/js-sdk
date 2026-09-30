import { useMemo } from "react";
import { matchesPredictionUnderlying } from "../binary/productScope";
import type { PredictionState } from "../prediction.script";

/** Keep the provider's account-wide state intact; scope only a panel projection. */
export const useScopedPredictionState = (
  state: PredictionState,
  underlyingSymbol?: string,
) =>
  useMemo(() => {
    if (!underlyingSymbol) return state;
    const matches = (symbol?: string) =>
      matchesPredictionUnderlying(symbol, underlyingSymbol);
    const openOrders = state.openOrders.filter((item) => matches(item.symbol));
    return {
      ...state,
      positions: state.positions.filter((item) => matches(item.symbol)),
      openOrders,
      history: state.history.filter((item) => matches(item.symbol)),
      settlements: state.settlements.filter((item) => matches(item.symbol)),
      cancelAllOrders: async () => {
        await Promise.all(
          openOrders.map((item) => state.cancelOrder(item.id, item.symbol)),
        );
      },
    };
  }, [state, underlyingSymbol]);
