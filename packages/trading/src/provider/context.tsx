import { createContext, PropsWithChildren, useContext } from "react";
import { useSymbolsInfo } from "@orderly.network/hooks";
import { TradingPageState, TradingPageProps } from "../types/types";
import { getBasicSymbolInfo } from "../utils/utils";

export const TradingPageContext = createContext({} as TradingPageState);
export const useTradingPageContext = () => {
  return useContext(TradingPageContext);
};

export const TradingPageProvider = (
  props: PropsWithChildren<TradingPageProps>
) => {
  const symbolInfo = useSymbolsInfo()[props.symbol];

  return (
    <TradingPageContext.Provider
      value={{
        ...props,
        symbolInfo: {
          ...getBasicSymbolInfo(symbolInfo),
          symbol: props.symbol,
        },
      }}
    >
      {props.children}
    </TradingPageContext.Provider>
  );
};
