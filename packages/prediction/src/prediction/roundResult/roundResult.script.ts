import { useEffect, useMemo } from "react";
import { useModal, useScreen } from "@orderly.network/ui";
import {
  binaryPersonalSettlementStatus,
  binaryRoundPersonalRecords,
  hasBinaryPriceEvidence,
  publishedBinaryOutcome,
} from "../binary/binarySettlement";
import type { PredictionState } from "../prediction.script";

export const BinaryEvidenceDialogId = "BinaryEvidenceDialog";
export const BinaryEvidenceSheetId = "BinaryEvidenceSheet";
export const BinarySettlementDialogId = "BinarySettlementDialog";
export const BinarySettlementSheetId = "BinarySettlementSheet";

export function useRoundResultScript(state: PredictionState) {
  const { isMobile } = useScreen();
  const evidenceModal = useModal(
    isMobile ? BinaryEvidenceSheetId : BinaryEvidenceDialogId,
  );
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
  const evidenceArgs = useMemo(
    () => ({ row: state.selectedRow }),
    [state.selectedRow],
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
    if (evidenceModal.visible) evidenceModal.updateArgs(evidenceArgs);
  }, [evidenceModal.visible, evidenceModal.updateArgs, evidenceArgs]);
  useEffect(() => {
    if (settlementModal.visible) settlementModal.updateArgs(settlementArgs);
  }, [settlementModal.visible, settlementModal.updateArgs, settlementArgs]);
  useEffect(
    () => () => {
      void evidenceModal.hide();
      void settlementModal.hide();
    },
    [
      state.accountId,
      state.selectedRow?.symbol,
      evidenceModal.hide,
      settlementModal.hide,
    ],
  );

  return {
    row: state.selectedRow,
    outcome: publishedBinaryOutcome(state.selectedRow),
    evidenceAvailable: hasBinaryPriceEvidence(state.selectedRow),
    evidenceLoading: state.roundDetailLoading,
    evidenceFailed: Boolean(state.roundDetailError),
    retryEvidence: () => {
      void state.refreshRoundDetail().catch(() => undefined);
    },
    showEvidence: () => {
      void evidenceModal.show(evidenceArgs).catch(() => undefined);
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
