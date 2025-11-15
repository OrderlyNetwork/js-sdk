import { FC, PropsWithChildren, useMemo } from "react";
import { useSymbolsInfo } from "@orderly.network/hooks";
import { useStarChildMarketSwitch } from "../hooks/useStarChildMarketSwitch";
import { TradingPageState, TradingPageProps } from "../types/types";
import { getBasicSymbolInfo } from "../utils/utils";
import { TradingPageContext } from "./tradingPageContext";

export const TradingPageProvider: FC<PropsWithChildren<TradingPageProps>> = (
  props,
) => {
  const { symbol, children } = props;
  const symbolsInfoMap = useSymbolsInfo();
  const symbolInfo = symbolsInfoMap[symbol];

  const memoizedValue = useMemo<TradingPageState>(() => {
    const basicSymbol = getBasicSymbolInfo(symbolInfo);
    return {
      ...props,
      symbolInfo: {
        ...basicSymbol,
        symbol: symbol,
      },
    };
  }, [props, symbol, symbolInfo]);

  // Listen for StarChild market switch events and proxy to onSymbolChange
  useStarChildMarketSwitch(symbol, symbolsInfoMap, props.onSymbolChange);

  return (
    <TradingPageContext.Provider value={memoizedValue}>
      {children}
    </TradingPageContext.Provider>
  );
};
