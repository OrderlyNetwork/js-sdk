import { useEffect, useMemo } from "react";
import { useModal, useScreen } from "@orderly.network/ui";
import {
  binaryPersonalSettlementStatus,
  binaryRoundPersonalRecords,
  hasBinarySettledDetail,
  publishedBinaryOutcome,
} from "../binary/binarySettlement";
import type { PredictionState } from "../prediction.script";

export const BinarySettlementDialogId = "BinarySettlementDialog";
export const BinarySettlementSheetId = "BinarySettlementSheet";

export function useRoundResultScript(state: PredictionState) {
  const { isMobile } = useScreen();
  const settlementModal = useModal(
    isMobile ? BinarySettlementSheetId : BinarySettlementDialogId,
  );
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
  const settlementArgs = useMemo(
    () => ({
      accountId: state.accountId,
      symbol: state.selectedRow?.symbol,
      records: personal.expiryRecords,
      conflict: personal.conflict,
      conflictedRecordKeys: personal.conflictedRecordKeys,
      loading: state.historyLoading,
      failed: Boolean(state.historyError),
    }),
    [
      state.accountId,
      state.selectedRow?.symbol,
      personal,
      state.historyLoading,
      state.historyError,
    ],
  );

  // Keep open details current; close them when their owner or selected round changes.
  useEffect(() => {
    if (settlementModal.visible) settlementModal.updateArgs(settlementArgs);
  }, [settlementModal.visible, settlementModal.updateArgs, settlementArgs]);
  useEffect(
    () => () => {
      void settlementModal.hide();
    },
    [state.accountId, state.selectedRow?.symbol, settlementModal.hide],
  );

  return {
    row: state.selectedRow,
    outcome: publishedBinaryOutcome(state.selectedRow),
    detailAvailable: hasBinarySettledDetail(state.selectedRow),
    detailLoading: state.roundDetailLoading,
    detailFailed: Boolean(state.roundDetailError),
    retryDetail: () => {
      void state.refreshRoundDetail().catch(() => undefined);
    },
    showSettlement: () => {
      void settlementModal.show(settlementArgs).catch(() => undefined);
    },
    records: personal.expiryRecords,
    conflict: personal.conflict,
    conflictedRecordKeys: personal.conflictedRecordKeys,
    status,
    historyLoading: !!state.accountId && state.historyLoading,
    historyFailed: !!state.accountId && Boolean(state.historyError),
    nextRoundAvailable: !!state.nextTradableRow,
    goToNextRound: state.goToNextRound,
  };
}

export type RoundResultState = ReturnType<typeof useRoundResultScript>;
