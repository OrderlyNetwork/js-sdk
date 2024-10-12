import { createContext, PropsWithChildren, useContext } from "react";
import { useSymbolsInfo } from "@orderly.network/hooks";
import { TradingPageState, TradingPageV2Props } from "../types/types";
import { MEDIA_TABLET } from "@orderly.network/types";
import { getBasicSymbolInfo } from "../utils/utils";

export const TradingPageContext = createContext({} as TradingPageState);
export const useTradingPageContext = () => {
  return useContext(TradingPageContext);
};

export const TradingPageProvider = (
  props: PropsWithChildren<TradingPageV2Props>
) => {
  const { tabletMediaQuery = MEDIA_TABLET, ...rest } = props;
  const symbolInfo = useSymbolsInfo()[props.symbol];

  return (
    <TradingPageContext.Provider
      value={{
        ...props,
        tabletMediaQuery: tabletMediaQuery,
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
