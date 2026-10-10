import React, { useCallback } from "react";
import { usePredictionTradingExtension } from "@orderly.network/prediction";
import { useAppContext } from "@orderly.network/react-app";
import { useTradingLocalStorage } from "../../hooks/useTradingLocalStorage";
import { TradingPageProvider } from "../../provider/tradingPageProvider";
import { TradingPageProps } from "../../types/types";
import { TradingWidget } from "./trading.widget";

export const TradingPage: React.FC<TradingPageProps> = (props) => {
  const { onRouteChange } = useAppContext();
  const { showAllSymbol, pnlNotionalDecimalPrecision } =
    useTradingLocalStorage();
  const onPredictionSelect = useCallback(
    (marketId: string) => {
      onRouteChange?.({
        href: `/prediction/${encodeURIComponent(marketId)}`,
        name: "prediction",
      });
    },
    [onRouteChange],
  );
  const predictionExtension = usePredictionTradingExtension({
    symbol: props.symbol,
    showAllSymbol,
    pnlNotionalDecimalPrecision,
    onPredictionSelect,
    onSymbolChange: props.onSymbolChange,
    sharePnLConfig: props.sharePnLConfig,
    enabled: props.predictionEnabled ?? true,
    marketsEnabled: !!onRouteChange && props.marketsDropdown == null,
    accountPanelsEnabled: props.dataListProductContent == null,
  });

  return (
    <TradingPageProvider
      symbol={props.symbol}
      tradingViewConfig={props.tradingViewConfig}
      onSymbolChange={props.onSymbolChange}
      marketsDropdown={
        props.marketsDropdown ??
        (onRouteChange ? predictionExtension.marketsDropdown : undefined)
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
