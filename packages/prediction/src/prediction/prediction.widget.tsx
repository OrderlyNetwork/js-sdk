import React from "react";
import { useCanTrade, useAppContext } from "@orderly.network/react-app";
import { AssetViewWidget, useFirstTimeDeposit } from "@orderly.network/trading";
import { usePredictionScript } from "./prediction.script";
import { Prediction } from "./prediction.ui";

export const PredictionWidget: React.FC = () => {
  const state = usePredictionScript();
  const canTrade = useCanTrade();
  const { disabledConnect } = useAppContext();
  const isFirstTimeDeposit = useFirstTimeDeposit();
  const isRegionRestricted =
    disabledConnect || state.prototypeRegionState === "restricted";

  return (
    <Prediction
      {...state}
      accountPanel={<AssetViewWidget isFirstTimeDeposit={isFirstTimeDeposit} />}
      orderEntryAccountReady={canTrade}
      orderEntryFunded={canTrade && !isFirstTimeDeposit}
      orderEntryRestricted={isRegionRestricted}
      showPrototypeRestrictionNotice={
        state.prototypeRegionState === "restricted" && !disabledConnect
      }
    />
  );
};
