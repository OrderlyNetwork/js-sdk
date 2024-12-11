import { FC, PropsWithChildren, createContext, useContext } from "react";
import { useSymbolsInfo } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";

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

export const SymbolContext = createContext({} as SymbolContextState);

export const useSymbolContext = () => {
  return useContext(SymbolContext);
};

interface FormatterProviderProps {
  symbol: string;
}

export const SymbolProvider: FC<PropsWithChildren<FormatterProviderProps>> = (
  props
) => {
  const symbolInfo = useSymbolsInfo()[props.symbol];

  return (
    <SymbolContext.Provider
      value={{
        base_dp: symbolInfo("base_dp"),
        quote_dp: symbolInfo("quote_dp"),
        base_tick: symbolInfo("base_tick"),
        quote_tick: symbolInfo("quote_tick"),
        base: symbolInfo("base"),
        quote: symbolInfo("quote"),
        symbol: props.symbol,
        origin: symbolInfo(),
        quote_max: symbolInfo("quote_max"),
        quote_min: symbolInfo("quote_min")
      }}
    >
      {props.children}
    </SymbolContext.Provider>
  );
};
