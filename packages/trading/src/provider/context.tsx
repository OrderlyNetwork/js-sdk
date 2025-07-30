import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
} from "react";
import { useSymbolsInfo } from "@orderly.network/hooks";
import { TradingPageState, TradingPageProps } from "../types/types";
import { getBasicSymbolInfo } from "../utils/utils";

export const TradingPageContext = createContext({} as TradingPageState);

export const useTradingPageContext = () => {
  return useContext(TradingPageContext);
};

export const TradingPageProvider: React.FC<
  React.PropsWithChildren<TradingPageProps>
> = (props) => {
  const { symbol, children } = props;
  const symbolInfo = useSymbolsInfo()[symbol];
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
  return (
    <TradingPageContext.Provider value={memoizedValue}>
      {children}
    </TradingPageContext.Provider>
  );
};
