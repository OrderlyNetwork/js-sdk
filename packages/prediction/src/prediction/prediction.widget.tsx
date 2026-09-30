import React, { useEffect } from "react";
import { useCanTrade, useAppContext } from "@orderly.network/react-app";
import { AssetViewWidget, useFirstTimeDeposit } from "@orderly.network/trading";
import type { API } from "@orderly.network/types";
import { usePredictionScript } from "./prediction.script";
import type { PredictionState } from "./prediction.script";
import { Prediction } from "./prediction.ui";
import {
  useSharedPredictionLive,
  useSharedPredictionState,
} from "./predictionProvider";

export type PredictionWidgetProps = {
  onPerpSymbolChange?: (symbol: API.Symbol) => void;
  marketId?: string;
  onPredictionMarketChange?: (marketId: string, replace?: boolean) => void;
};

export const PredictionWidget: React.FC<PredictionWidgetProps> = (props) => {
  const state = useSharedPredictionState();
  return state ? (
    <PredictionWithState state={state} {...props} />
  ) : (
    <StandalonePrediction {...props} />
  );
};
const StandalonePrediction = (props: PredictionWidgetProps) => {
  const { disabledConnect } = useAppContext();
  const state = usePredictionScript(disabledConnect);
  return <PredictionWithState state={state} {...props} />;
};
const PredictionWithState = ({
  state,
  onPerpSymbolChange,
  marketId,
  onPredictionMarketChange,
}: { state: PredictionState } & PredictionWidgetProps) => {
  const canTrade = useCanTrade();
  const isFirstTimeDeposit = useFirstTimeDeposit();
  const isRegionRestricted = state.isRegionRestricted;
  // The page keeps the per-tick market streams alive while it is mounted;
  // dropdown/panel consumers on other routes do not.
  useSharedPredictionLive();

  useEffect(() => {
    if (!state.markets.length) return;
    if (marketId == null) {
      if (state.marketId) onPredictionMarketChange?.(state.marketId, true);
    } else if (
      marketId !== state.marketId &&
      state.markets.some((market) => market.id === marketId)
    ) {
      state.selectMarket(marketId);
    }
  }, [
    marketId,
    onPredictionMarketChange,
    state.marketId,
    state.markets,
    state.selectMarket,
  ]);

  return (
    <Prediction
      {...state}
      accountPanel={<AssetViewWidget isFirstTimeDeposit={isFirstTimeDeposit} />}
      orderEntryAccountReady={canTrade}
      orderEntryFunded={canTrade && !isFirstTimeDeposit}
      orderEntryRestricted={isRegionRestricted}
      onPerpSymbolChange={onPerpSymbolChange}
      requestedMarketId={marketId}
      onPredictionMarketChange={onPredictionMarketChange}
    />
  );
};
