import { createContext, PropsWithChildren, useContext } from "react";
import { useSymbolsInfo, utils } from "@orderly.network/hooks";
import { TradingPageState, TradingPageV2Props } from "../types/types";
import { API } from "@orderly.network/types";
import { getBasicSymbolInfo } from "../utils/utils";

export const TradingPageContext = createContext({} as TradingPageState);
export const useTradingPateContext = () => {
  return useContext(TradingPageContext);
};

export const TradingPageProvider = (
  props: PropsWithChildren<TradingPageV2Props>
) => {
  const symbolInfo = useSymbolsInfo()[props.symbol];

  console.log("trading page provider", props,  "symbol info", symbolInfo);
  

  return (
    <TradingPageContext.Provider
      value={{
        ...props,
        symbolInfo: {
          ...(getBasicSymbolInfo(symbolInfo)),
          symbol: props.symbol,
        },
      }}
    >
      {props.children}
    </TradingPageContext.Provider>
  );
};

