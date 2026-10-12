import React, { useCallback } from "react";
import {
  usePredictionMarketTabs,
  usePredictionMarketsDropdown,
} from "@orderly.network/prediction";
import { useAppContext } from "@orderly.network/react-app";
import { injectable } from "@orderly.network/ui";
import { TradingPageProvider } from "../../provider/tradingPageProvider";
import { TradingPageProps } from "../../types/types";
import { TradingWidget } from "./trading.widget";

/** Inner page: receives props and renders provider + widget. Layout strategy from props (host or plugin). */
const TradingPageInner: React.FC<TradingPageProps> = (props) => {
  const { onRouteChange } = useAppContext();
  const defaultPredictionSelect = useCallback(
    (symbol: string) => {
      onRouteChange?.({
        href: `/prediction/${encodeURIComponent(symbol)}`,
        name: "prediction",
      });
    },
    [onRouteChange],
  );
  const hasPredictionNavigation = !!onRouteChange;
  const predictionEnabled =
    (props.predictionEnabled ?? true) &&
    hasPredictionNavigation &&
    (props.marketsDropdown == null ||
      props.marketsSheet == null ||
      props.sideMarkets == null);
  // One shared data pipeline feeds every surface; each slot only swaps in its
  // own default tab set and reuses the surface-agnostic renderers.
  const dropdown = usePredictionMarketsDropdown(defaultPredictionSelect, {
    enabled: predictionEnabled,
  });
  const sheetTabs = usePredictionMarketTabs("marketsSheet");
  const sideMarketsTabs = usePredictionMarketTabs("expandMarkets");
  const marketsSheet = {
    tabs: sheetTabs,
    renderTabContent: dropdown.renderTabContent,
    renderTabAfterContent: dropdown.renderTabAfterContent,
  };
  const sideMarkets = {
    tabs: sideMarketsTabs,
    renderTabContent: dropdown.renderTabContent,
    renderTabAfterContent: dropdown.renderTabAfterContent,
  };

  return (
    <TradingPageProvider
      symbol={props.symbol}
      tradingViewConfig={props.tradingViewConfig}
      onSymbolChange={props.onSymbolChange}
      disableFeatures={props.disableFeatures}
      overrideFeatures={props.overrideFeatures}
      referral={props.referral}
      tradingRewards={props.tradingRewards}
      bottomSheetLeading={props.bottomSheetLeading}
      sharePnLConfig={props.sharePnLConfig}
      layoutStrategy={props.layoutStrategy}
      getInitialLayout={props.getInitialLayout}
      marketsDropdown={
        props.marketsDropdown ?? (predictionEnabled ? dropdown : undefined)
      }
      marketsSheet={
        props.marketsSheet ?? (predictionEnabled ? marketsSheet : undefined)
      }
      sideMarkets={
        props.sideMarkets ?? (predictionEnabled ? sideMarkets : undefined)
      }
    >
      <TradingWidget />
    </TradingPageProvider>
  );
};

/** Injectable so layout plugins can intercept and inject layoutStrategy/getInitialLayout when host does not pass them */
export const TradingPage = injectable(TradingPageInner, "Trading.Page");
