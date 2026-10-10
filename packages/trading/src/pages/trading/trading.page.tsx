import React, { useCallback } from "react";
import { usePredictionTradingExtension } from "@orderly.network/prediction";
import { useAppContext } from "@orderly.network/react-app";
import type { API } from "@orderly.network/types";
import { useTradingLocalStorage } from "../../hooks/useTradingLocalStorage";
import { TradingPageProvider } from "../../provider/tradingPageProvider";
import { TradingPageProps } from "../../types/types";
import { TradingWidget } from "./trading.widget";

export const TradingPage: React.FC<TradingPageProps> = (props) => {
  const { onRouteChange } = useAppContext();
  const { showAllSymbol, pnlNotionalDecimalPrecision } =
    useTradingLocalStorage();
  const defaultPredictionSelect = useCallback(
    (symbol: string) => {
      onRouteChange?.({
        href: `/prediction/${encodeURIComponent(symbol)}`,
        name: "prediction",
      });
    },
    [onRouteChange],
  );
  const onSymbolChange = useCallback(
    (market: API.Symbol) => {
      if (market.symbol === props.symbol) return;
      if (props.onSymbolChange) {
        props.onSymbolChange(market);
      } else {
        onRouteChange?.({
          href: `/perp/${encodeURIComponent(market.symbol)}`,
          name: "perps",
        });
      }
    },
    [props.symbol, props.onSymbolChange, onRouteChange],
  );
  const hasPredictionNavigation = !!onRouteChange;
  const predictionExtension = usePredictionTradingExtension({
    symbol: props.symbol,
    showAllSymbol,
    pnlNotionalDecimalPrecision,
    onPredictionSelect: defaultPredictionSelect,
    onSymbolChange:
      props.onSymbolChange || onRouteChange ? onSymbolChange : undefined,
    sharePnLConfig: props.sharePnLConfig,
    enabled: props.predictionEnabled ?? true,
    marketsEnabled: hasPredictionNavigation && props.marketsDropdown == null,
    accountPanelsEnabled: props.dataListProductContent == null,
  });

  return (
    <TradingPageProvider
      symbol={props.symbol}
      tradingViewConfig={props.tradingViewConfig}
      onSymbolChange={
        props.onSymbolChange || onRouteChange ? onSymbolChange : undefined
      }
      marketsDropdown={
        props.marketsDropdown ??
        (hasPredictionNavigation
          ? predictionExtension.marketsDropdown
          : undefined)
      }
      disableFeatures={props.disableFeatures}
      overrideFeatures={props.overrideFeatures}
      referral={props.referral}
      tradingRewards={props.tradingRewards}
      bottomSheetLeading={props.bottomSheetLeading}
      sharePnLConfig={props.sharePnLConfig}
      dataListProductContent={
        props.dataListProductContent ??
        predictionExtension.dataListProductContent
      }
    >
      <TradingWidget />
    </TradingPageProvider>
  );
};
