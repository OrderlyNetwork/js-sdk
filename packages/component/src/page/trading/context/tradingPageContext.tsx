import React, { PropsWithChildren } from "react";

export interface TradingPageContextValue {
  onSymbolChange?: (symbol: string) => void;
  symbol: string;
}

export const TradingPageContext = React.createContext<TradingPageContextValue>(
  {} as TradingPageContextValue
);

export interface TradingPageProviderProps {
  onSymbolChange?: (symbol: string) => void;
  symbol: string;
}

export const TradingPageProvider: React.FC<
  PropsWithChildren<TradingPageProviderProps>
> = ({ children, onSymbolChange, symbol }) => {
  return (
    <TradingPageContext.Provider value={{ onSymbolChange, symbol }}>
      {children}
    </TradingPageContext.Provider>
  );
};
