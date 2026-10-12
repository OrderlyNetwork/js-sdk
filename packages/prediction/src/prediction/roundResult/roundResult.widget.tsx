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
  if (props.outcome)
    return (
      <RoundResultUI
        {...props}
        marketName={marketName}
        intervalSeconds={intervalSeconds}
      />
    );
  return (
    <RoundOrderStatusCard
      marketName={marketName}
      intervalSeconds={intervalSeconds}
      round={state.selectedRound}
      roundPhase="closed"
      isRoundInSnapshot={state.isRoundInSnapshot}
    />
  );
}
