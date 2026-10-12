import { useTranslation } from "@orderly.network/i18n";
import { Button } from "@orderly.network/ui";
import { RoundOrderStatusCard } from "../orderEntry";
import type { PredictionState } from "../prediction.script";
import { useRoundResultScript } from "./roundResult.script";
import { RoundResultUI } from "./roundResult.ui";

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
        {props.detailFailed && state.isRoundInSnapshot && (
          <Button
            fullWidth
            size="sm"
            variant="outlined"
            disabled={props.detailLoading}
            onClick={props.retryDetail}
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
