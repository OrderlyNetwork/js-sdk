import { API } from "@orderly.network/types";
import React, { PropsWithChildren, ReactNode, useContext } from "react";
import { TradingFeatures } from "../features";
import { useExecutionReport } from "../shared/hooks/useExecutionReport";

export interface TradingPageContextValue {
  onSymbolChange?: (symbol: API.Symbol) => void;
  symbol: string;

  disableFeatures: TradingFeatures[];
  overrides?: Record<TradingFeatures, ReactNode>;
}

export const TradingPageContext = React.createContext<TradingPageContextValue>(
  {} as TradingPageContextValue
);

export interface TradingPageProviderProps {
  onSymbolChange?: (symbol: API.Symbol) => void;
  symbol: string;
  disableFeatures?: TradingFeatures[];
  overrides?: Record<TradingFeatures, ReactNode>;
}

export const useTradingPageContext = () => {
  return useContext(TradingPageContext);
};

export const TradingPageProvider: React.FC<
  PropsWithChildren<TradingPageProviderProps>
> = ({ children, onSymbolChange, symbol, disableFeatures = [], overrides }) => {
  useExecutionReport();
  return (
    <TradingPageContext.Provider
      value={{ onSymbolChange, symbol, disableFeatures, overrides }}
    >
      {children}
    </TradingPageContext.Provider>
  );
};
