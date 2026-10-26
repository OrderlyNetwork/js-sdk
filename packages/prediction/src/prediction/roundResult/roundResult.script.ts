import { useMemo } from "react";
import {
  binaryPersonalSettlementStatus,
  binaryRoundPersonalRecords,
  hasBinarySettledDetail,
  publishedBinaryOutcome,
} from "../binary/binarySettlement";
import type { PredictionState } from "../prediction.script";

export function useRoundResultScript(state: PredictionState) {
  const personal = useMemo(
    () =>
      binaryRoundPersonalRecords(
        state.historyRecords,
        state.selectedRow?.symbol,
      ),
    [state.historyRecords, state.selectedRow?.symbol],
  );
  const status = binaryPersonalSettlementStatus(
    personal.expiryRecords,
    personal.conflict,
    state.pendingSettlementSymbols.includes(state.selectedRow?.symbol ?? ""),
  );

  return {
    row: state.selectedRow,
    outcome: publishedBinaryOutcome(state.selectedRow),
    detailAvailable: hasBinarySettledDetail(state.selectedRow),
    detailLoading: state.roundDetailLoading,
    detailFailed: Boolean(state.roundDetailError),
    records: personal.expiryRecords,
    conflict: personal.conflict,
    conflictedRecordKeys: personal.conflictedRecordKeys,
    status,
    historyLoading: !!state.accountId && state.historyLoading,
    historyFailed: !!state.accountId && Boolean(state.historyError),
  };
}

export type RoundResultState = ReturnType<typeof useRoundResultScript>;
