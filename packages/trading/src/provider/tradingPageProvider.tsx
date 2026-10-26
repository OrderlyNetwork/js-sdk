import { FC, PropsWithChildren, useCallback, useMemo } from "react";
import { useSymbolsInfo } from "@orderly.network/hooks";
import { useAppContext } from "@orderly.network/react-app";
import { perpRoute, predictionRoute, type API } from "@orderly.network/types";
import { usePredictionIntegration } from "../hooks/usePredictionIntegration";
import { useTradingLocalStorage } from "../hooks/useTradingLocalStorage";
import { TradingPageState, TradingPageProps } from "../types/types";
import { getBasicSymbolInfo } from "../utils/utils";
import { TradingPageContext } from "./tradingPageContext";

export const TradingPageProvider: FC<PropsWithChildren<TradingPageProps>> = (
  props,
) => {
  const { symbol, children } = props;
  const { onRouteChange } = useAppContext();
  const { showAllSymbol, pnlNotionalDecimalPrecision } =
    useTradingLocalStorage();
  const selectPrediction = useCallback(
    (nextSymbol: string) => {
      onRouteChange?.(predictionRoute(nextSymbol));
    },
    [onRouteChange],
  );
  const selectPerp = useCallback(
    (market: API.Symbol) => {
      if (market.symbol === symbol) return;
      if (props.onSymbolChange) props.onSymbolChange(market);
      else onRouteChange?.(perpRoute(market.symbol));
    },
    [symbol, props.onSymbolChange, onRouteChange],
  );
  const onSymbolChange =
    props.onSymbolChange || onRouteChange ? selectPerp : undefined;
  const prediction = usePredictionIntegration({
    symbol,
    showAllSymbol,
    pnlNotionalDecimalPrecision,
    onPredictionSelect: onRouteChange ? selectPrediction : undefined,
    onSymbolChange,
    sharePnLConfig: props.sharePnLConfig,
    marketsEnabled: !!onRouteChange,
  });
  const symbolInfo = useSymbolsInfo()[symbol];

  const memoizedValue = useMemo<TradingPageState>(() => {
    const basicSymbol = getBasicSymbolInfo(symbolInfo);
    return {
      ...props,
      ...prediction,
      onSymbolChange,
      symbolInfo: {
        ...basicSymbol,
        symbol: symbol,
      },
    };
  }, [props, symbol, symbolInfo, prediction, onSymbolChange]);
  return (
    <TradingPageContext.Provider value={memoizedValue}>
      {children}
    </TradingPageContext.Provider>
  );
};
