import { useAccount } from "@orderly.network/hooks";
import { i18n, useTranslation } from "@orderly.network/i18n";
import { AccountStatusEnum } from "@orderly.network/types";
import {
  Button,
  registerSimpleDialog,
  registerSimpleSheet,
} from "@orderly.network/ui";
import { RoundOrderStatusCard } from "../orderEntry";
import type { PredictionState } from "../prediction.script";
import {
  BinaryEvidenceDialogId,
  BinaryEvidenceSheetId,
  BinarySettlementDialogId,
  BinarySettlementSheetId,
  useRoundResultScript,
} from "./roundResult.script";
import {
  BinaryPriceEvidenceUI,
  BinarySettlementDetailsUI,
  RoundResultUI,
} from "./roundResult.ui";

// Modal snapshots must not expose personal records after an account switch.
function SettlementModal(
  props: Parameters<typeof BinarySettlementDetailsUI>[0] & {
    accountId?: string;
  },
) {
  const { state } = useAccount();
  const ready =
    state.status >= AccountStatusEnum.EnableTrading ||
    state.status === AccountStatusEnum.EnableTradingWithoutConnected;
  return ready && props.accountId && state.accountId === props.accountId ? (
    <BinarySettlementDetailsUI {...props} />
  ) : null;
}
registerSimpleDialog(BinaryEvidenceDialogId, BinaryPriceEvidenceUI, {
  size: "md",
  title: () => i18n.t("prediction.resolution.priceEvidence"),
});
registerSimpleSheet(BinaryEvidenceSheetId, BinaryPriceEvidenceUI, {
  title: () => i18n.t("prediction.resolution.priceEvidence"),
});
registerSimpleDialog(BinarySettlementDialogId, SettlementModal, {
  size: "md",
  title: () => i18n.t("prediction.resolution.settlementDetails"),
});
registerSimpleSheet(BinarySettlementSheetId, SettlementModal, {
  title: () => i18n.t("prediction.resolution.settlementDetails"),
});

export function RoundResultWidget({
  state,
  marketName,
  intervalSeconds,
}: {
  state: PredictionState;
  marketName: string;
  intervalSeconds: number;
}) {
  const props = useRoundResultScript(state);
  const { t } = useTranslation();
  if (props.outcome)
    return (
      <RoundResultUI
        {...props}
        marketName={marketName}
        intervalSeconds={intervalSeconds}
      />
    );
  return (
    <div className="oui-space-y-3 oui-rounded-xl oui-bg-base-9 oui-pb-4">
      <RoundOrderStatusCard
        marketName={marketName}
        intervalSeconds={intervalSeconds}
        round={state.selectedRound}
        roundPhase="closed"
        isRoundInSnapshot={state.isRoundInSnapshot}
      />
      <div className="oui-space-y-3 oui-px-4">
        {props.evidenceFailed && state.isRoundInSnapshot && (
          <Button
            fullWidth
            size="sm"
            variant="outlined"
            disabled={props.evidenceLoading}
            onClick={props.retryEvidence}
          >
            {t("prediction.resolution.retry")}
          </Button>
        )}
        <Button
          fullWidth
          size="md"
          disabled={!props.nextRoundAvailable}
          onClick={props.goToNextRound}
        >
          {t("prediction.resolution.nextRound")}
        </Button>
      </div>
    </div>
  );
}
