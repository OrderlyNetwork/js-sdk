import React, { useCallback, useEffect, useRef } from "react";
import { useCanTrade, useAppContext } from "@orderly.network/react-app";
import {
  AssetViewWidget,
  useFirstTimeDeposit,
} from "@orderly.network/trading-common";
import { usePredictionScript } from "./prediction.script";
import type { PredictionState } from "./prediction.script";
import type { PredictionMarketSelection } from "./prediction.types";
import { Prediction } from "./prediction.ui";

export type PredictionWidgetProps = {
  /**
   * Prediction market family ID, e.g. `PERP_BTC5M_USDC`, shared across rounds.
   * This is not a tradable round symbol such as `PERP_BTC5M2608271200_USDC`.
   */
  marketId?: string;
  /** Reports a user-selected market; the host updates marketId and optionally its URL. */
  onSymbolChange?: (market: PredictionMarketSelection) => void;
};

export const PredictionWidget: React.FC<PredictionWidgetProps> = (props) => {
  const { disabledConnect } = useAppContext();
  const state = usePredictionScript(disabledConnect);
  return <PredictionWithState state={state} {...props} />;
};
const PredictionWithState = ({
  state,
  marketId,
  onSymbolChange,
}: { state: PredictionState } & PredictionWidgetProps) => {
  const { onRouteChange } = useAppContext();
  const completedDefaultRoute = useRef<string>();
  const selectMarket = useCallback(
    (id: string) => {
      if (id === (marketId ?? state.marketId)) return;
      if (onSymbolChange) {
        onSymbolChange({ marketId: id });
      } else {
        onRouteChange?.({
          href: `/prediction/${encodeURIComponent(id)}`,
          name: "prediction",
        });
      }
    },
    [marketId, state.marketId, onSymbolChange, onRouteChange],
  );
  const navigatePerp = useCallback(
    (market: { symbol: string }) => {
      onRouteChange?.({
        href: `/perp/${encodeURIComponent(market.symbol)}`,
        name: "perps",
      });
    },
    [onRouteChange],
  );
  const canTrade = useCanTrade();
  const isFirstTimeDeposit = useFirstTimeDeposit();
  const isRegionRestricted = state.isRegionRestricted;

  useEffect(() => {
    if (!state.markets.length) return;
    if (marketId == null) {
      if (
        !onSymbolChange &&
        onRouteChange &&
        state.marketId &&
        completedDefaultRoute.current !== state.marketId
      ) {
        completedDefaultRoute.current = state.marketId;
        onRouteChange({
          href: `/prediction/${encodeURIComponent(state.marketId)}`,
          name: "prediction",
          replace: true,
        });
      }
    } else {
      completedDefaultRoute.current = undefined;
      if (
        marketId !== state.marketId &&
        state.markets.some((market) => market.id === marketId)
      ) {
        state.selectMarket(marketId);
      }
    }
  }, [
    marketId,
    onSymbolChange,
    onRouteChange,
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
      onNavigatePerp={onRouteChange ? navigatePerp : undefined}
      requestedMarketId={marketId}
      onSelectMarket={
        onSymbolChange || onRouteChange ? selectMarket : undefined
      }
    />
  );
};
