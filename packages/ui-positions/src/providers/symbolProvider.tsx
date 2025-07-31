import React, { createContext, useContext, useMemo } from "react";
import { useSymbolsInfo } from "@orderly.network/hooks";
import type { API } from "@orderly.network/types";

export interface SymbolContextState {
  base_dp: number;
  quote_dp: number;
  base_tick: number;
  quote_tick: number;
  base: string;
  quote: string;
  symbol: string;
  origin: API.SymbolExt;
  quote_min: number;
  quote_max: number;
}

export const SymbolContext = createContext<SymbolContextState>(
  {} as SymbolContextState,
);

export const useSymbolContext = () => {
  return useContext<SymbolContextState>(SymbolContext);
};

interface FormatterProviderProps {
  symbol: string;
}

export const SymbolProvider: React.FC<
  React.PropsWithChildren<FormatterProviderProps>
> = (props) => {
  const { symbol, children } = props;
  const symbolInfo = useSymbolsInfo()[symbol];
  const memoizedValue = useMemo<SymbolContextState>(() => {
    return {
      symbol: symbol,
      base_dp: symbolInfo("base_dp"),
      quote_dp: symbolInfo("quote_dp"),
      base_tick: symbolInfo("base_tick"),
      quote_tick: symbolInfo("quote_tick"),
      base: symbolInfo("base"),
      quote: symbolInfo("quote"),
      origin: symbolInfo(),
      quote_max: symbolInfo("quote_max"),
      quote_min: symbolInfo("quote_min"),
    };
  }, [symbol, symbolInfo]);
  return (
    <SymbolContext.Provider value={memoizedValue}>
      {children}
    </SymbolContext.Provider>
  );
};
