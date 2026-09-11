import React from "react";
import { useCanTrade, useAppContext } from "@orderly.network/react-app";
import { AssetViewWidget, useFirstTimeDeposit } from "@orderly.network/trading";
import { usePredictionScript } from "./prediction.script";
import type { PredictionState } from "./prediction.script";
import { Prediction } from "./prediction.ui";
import { useSharedPredictionState } from "./predictionProvider";

export const PredictionWidget: React.FC = () => {
  const state = useSharedPredictionState();
  return state ? (
    <PredictionWithState state={state} />
  ) : (
    <StandalonePrediction />
  );
};
const StandalonePrediction = () => {
  const { disabledConnect } = useAppContext();
  const state = usePredictionScript(disabledConnect);
  return <PredictionWithState state={state} />;
};
const PredictionWithState = ({ state }: { state: PredictionState }) => {
  const canTrade = useCanTrade();
  const isFirstTimeDeposit = useFirstTimeDeposit();
  const isRegionRestricted = state.isRegionRestricted;

  return (
    <Prediction
      {...state}
      accountPanel={<AssetViewWidget isFirstTimeDeposit={isFirstTimeDeposit} />}
      orderEntryAccountReady={canTrade}
      orderEntryFunded={canTrade && !isFirstTimeDeposit}
      orderEntryRestricted={isRegionRestricted}
    />
  );
};
