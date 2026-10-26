import { useMemo } from "react";
import { matchesPredictionUnderlying } from "../binary/productScope";
import type { PredictionAccountPanelState } from "../prediction.types";

/** Keep account-wide data intact; scope only a panel projection. */
export const useScopedPredictionAccount = (
  state: PredictionAccountPanelState,
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
      historyRecords: state.historyRecords.filter((item) =>
        matches(item.symbol),
      ),
      cancelAllOrders: () => state.cancelAllOrders({ underlyingSymbol }),
    };
  }, [state, underlyingSymbol]);
