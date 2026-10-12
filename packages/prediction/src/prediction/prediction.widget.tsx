import React, { useCallback, useEffect, useRef, useState } from "react";
import { useCanTrade, useAppContext } from "@orderly.network/react-app";
import {
  AssetViewWidget,
  useFirstTimeDeposit,
} from "@orderly.network/trading-shared";
import { usePredictionScript } from "./prediction.script";
import type { PredictionSymbolSelection } from "./prediction.types";
import { Prediction } from "./prediction.ui";

export type PredictionWidgetProps = {
  /** Exact round contract, e.g. PERP_BTC5M2608271200_USDC. */
  symbol?: string;
  /** Requests selection; the host updates symbol and optionally its URL. */
  onSymbolChange?: (selection: PredictionSymbolSelection) => void;
};

export const PredictionWidget: React.FC<PredictionWidgetProps> = ({
  symbol,
  onSymbolChange,
}) => {
  const { disabledConnect, onRouteChange } = useAppContext();
  const [fallbackSymbol, setFallbackSymbol] = useState<string>();
  const hasExternalSymbol = symbol != null;
  const [hadExternalSymbol, setHadExternalSymbol] = useState(hasExternalSymbol);
  // Reset before rendering the new mode so a base route cannot reuse an old fallback.
  if (hadExternalSymbol !== hasExternalSymbol) {
    setHadExternalSymbol(hasExternalSymbol);
    setFallbackSymbol(undefined);
  }
  const effectiveSymbol = symbol ?? fallbackSymbol;
  const selectSymbol = useCallback(
    (nextSymbol: string) => {
      if (nextSymbol === effectiveSymbol) return;
      if (onSymbolChange) onSymbolChange({ symbol: nextSymbol });
      else
        onRouteChange?.({
          href: `/prediction/${encodeURIComponent(nextSymbol)}`,
          name: "prediction",
        });
    },
    [effectiveSymbol, onSymbolChange, onRouteChange],
  );
  const canSelect = !!(onSymbolChange || onRouteChange);
  const state = usePredictionScript(disabledConnect, true, true, {
    symbol: effectiveSymbol,
    onSymbolSelect: selectSymbol,
  });
  // Stable identity so the memoized market rows in the dropdown are not
  // re-rendered on every page tick.
  const selectedRowSymbol = state.selectedRow?.symbol;
  const selectRoundSymbol = useCallback(
    (next: string) => {
      if (next !== selectedRowSymbol) selectSymbol(next);
    },
    [selectedRowSymbol, selectSymbol],
  );
  useEffect(() => {
    if (symbol == null && fallbackSymbol == null && state.defaultSymbol) {
      setFallbackSymbol(state.defaultSymbol);
    }
  }, [symbol, fallbackSymbol, state.defaultSymbol]);
  const completedDefaultRoute = useRef(false);
  useEffect(() => {
    if (symbol != null) {
      completedDefaultRoute.current = false;
      return;
    }
    const defaultSymbol = fallbackSymbol;
    if (
      !onSymbolChange &&
      onRouteChange &&
      defaultSymbol &&
      !completedDefaultRoute.current
    ) {
      completedDefaultRoute.current = true;
      onRouteChange({
        href: `/prediction/${encodeURIComponent(defaultSymbol)}`,
        name: "prediction",
        replace: true,
      });
    }
  }, [symbol, onSymbolChange, onRouteChange, fallbackSymbol]);
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
  return (
    <Prediction
      {...state}
      accountPanel={<AssetViewWidget isFirstTimeDeposit={isFirstTimeDeposit} />}
      orderEntryAccountReady={canTrade}
      orderEntryFunded={canTrade && !isFirstTimeDeposit}
      orderEntryRestricted={state.isRegionRestricted}
      onNavigatePerp={onRouteChange ? navigatePerp : undefined}
      requestedSymbol={effectiveSymbol}
      onSelectSymbol={canSelect ? selectRoundSymbol : undefined}
      selectMarketRound={canSelect ? state.selectMarketRound : () => {}}
      goToLiveRound={canSelect ? state.goToLiveRound : () => {}}
      goToNextRound={canSelect ? state.goToNextRound : () => false}
    />
  );
};
