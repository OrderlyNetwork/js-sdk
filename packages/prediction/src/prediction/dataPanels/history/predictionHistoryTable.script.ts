import { useMemo } from "react";
import { matchesPredictionUnderlying } from "../../binary/productScope";
import { usePredictionSettlementHistory } from "../../hooks/usePredictionSettlementHistory";
import type { PredictionAccountPanelState } from "../../prediction.types";
import { usePredictionFilters } from "../../predictionFilters.script";

export const usePredictionHistoryTableScript = (
  state: PredictionAccountPanelState,
  underlyingSymbol?: string,
) => {
  const filters = usePredictionFilters(true);
  const history = usePredictionSettlementHistory({
    accountId: state.accountId,
    enabled: state.accountReady,
    includeSettlementHistory: true,
  });
  const historyState = useMemo(
    () => ({
      ...history,
      historyRecords: history.historyRecords.filter((row) =>
        matchesPredictionUnderlying(row.symbol, underlyingSymbol),
      ),
      settlements: history.settlements.filter((row) =>
        matchesPredictionUnderlying(row.symbol, underlyingSymbol),
      ),
    }),
    [history, underlyingSymbol],
  );
  return { filters, historyState };
};
export type PredictionHistoryTableScript = ReturnType<
  typeof usePredictionHistoryTableScript
>;
