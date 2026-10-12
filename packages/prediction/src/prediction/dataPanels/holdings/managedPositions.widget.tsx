import type { PredictionAccountPanelState } from "../../prediction.types";
import { useManagedPositionsScript } from "./managedPositions.script";
import { ManagedPositionsUI } from "./managedPositions.ui";

export type ManagedPredictionPositionsProps = {
  state: PredictionAccountPanelState;
  selectedAccount: string;
};

/** Account grouping is scoped to current positions; history and orders stay local. */
export function ManagedPredictionPositions(
  props: ManagedPredictionPositionsProps,
) {
  const script = useManagedPositionsScript(props.state, props.selectedAccount);
  return (
    <ManagedPositionsUI
      key={`${props.state.accountId}:${props.selectedAccount}`}
      {...script}
    />
  );
}
