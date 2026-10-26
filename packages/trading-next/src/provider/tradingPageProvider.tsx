import { FC, PropsWithChildren, useCallback, useMemo } from "react";
import { useSymbolsInfo } from "@orderly.network/hooks";
import {
  usePredictionMarketTabs,
  usePredictionMarketsDropdown,
} from "@orderly.network/prediction";
import { useAppContext, useFeatureEnabled } from "@orderly.network/react-app";
import { predictionRoute } from "@orderly.network/types";
import { TradingPageState, TradingPageProps } from "../types/types";
import { getBasicSymbolInfo } from "../utils/utils";
import { TradingPageContext } from "./tradingPageContext";

/**
 * Provider does not import a default layout strategy; consumer or desktop UI
 * should pass layoutStrategy via props or use a fallback when rendering LayoutHost.
 */
export const TradingPageProvider: FC<PropsWithChildren<TradingPageProps>> = (
  props,
) => {
  const { symbol, children } = props;
  const { onRouteChange } = useAppContext();
  const enabled = useFeatureEnabled("prediction") && !!onRouteChange;
  const selectPrediction = useCallback(
    (nextSymbol: string) => {
      onRouteChange?.(predictionRoute(nextSymbol));
    },
    [onRouteChange],
  );
  const dropdown = usePredictionMarketsDropdown(selectPrediction, { enabled });
  const sheetTabs = usePredictionMarketTabs("marketsSheet");
  const sideTabs = usePredictionMarketTabs("expandMarkets");
  const symbolInfo = useSymbolsInfo()[symbol];

  const memoizedValue = useMemo<TradingPageState>(() => {
    const basicSymbol = getBasicSymbolInfo(symbolInfo);
    return {
      ...props,
      marketsDropdown: enabled ? dropdown : undefined,
      marketsSheet: enabled
        ? {
            tabs: sheetTabs,
            renderTabContent: dropdown.renderTabContent,
            renderTabAfterContent: dropdown.renderTabAfterContent,
          }
        : undefined,
      sideMarkets: enabled
        ? {
            tabs: sideTabs,
            renderTabContent: dropdown.renderTabContent,
            renderTabAfterContent: dropdown.renderTabAfterContent,
          }
        : undefined,
      layoutStrategy: props.layoutStrategy,
      getInitialLayout: props.getInitialLayout,
      symbolInfo: {
        ...basicSymbol,
        symbol: symbol,
      },
    };
  }, [props, symbol, symbolInfo, enabled, dropdown, sheetTabs, sideTabs]);
  return (
    <TradingPageContext.Provider value={memoizedValue}>
      {children}
    </TradingPageContext.Provider>
  );
};
