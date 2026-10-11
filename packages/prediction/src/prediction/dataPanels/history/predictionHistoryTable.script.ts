import { useMemo } from "react";
import { binaryHistoryDisplayRows } from "../../binary/binarySettlement";
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
  const { matches } = filters;
  const historyRecords = useMemo(
    () =>
      history.historyRecords.filter((row) =>
        matchesPredictionUnderlying(row.symbol, underlyingSymbol),
      ),
    [history.historyRecords, underlyingSymbol],
  );
  const settlements = useMemo(
    () =>
      history.settlements.filter((row) =>
        matchesPredictionUnderlying(row.symbol, underlyingSymbol),
      ),
    [history.settlements, underlyingSymbol],
  );
  // binaryHistoryDisplayRows runs the stringify-based dedupe over all records;
  // memoized once here so desktop table and mobile cards share the result.
  const displayRecords = useMemo(
    () =>
      binaryHistoryDisplayRows(historyRecords).filter((record) =>
        matches({
          outcome: record.outcome ?? "",
          status: record.result === "closed" ? "closed" : "settled",
          timestamp: record.filterTime,
        }),
      ),
    [historyRecords, matches],
  );
  const historyState = useMemo(
    () => ({ ...history, historyRecords, settlements, displayRecords }),
    [history, historyRecords, settlements, displayRecords],
  );
  return { filters, historyState };
};
export type PredictionHistoryTableScript = ReturnType<
  typeof usePredictionHistoryTableScript
>;
