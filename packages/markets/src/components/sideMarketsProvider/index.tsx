import {
  FC,
  createContext,
  PropsWithChildren,
  useState,
  useContext,
  useCallback,
} from "react";
import { API } from "@orderly.network/types";

type SideMarketsContextState = {} & SideMarketsProviderProps;

export const SideMarketsContext = createContext({} as SideMarketsContextState);

export type SideMarketsProviderProps = {
  onSymbolChange?: (symbol: API.Symbol) => void;
};

export const SideMarketsProvider: FC<
  PropsWithChildren<SideMarketsProviderProps>
> = (props) => {
  return (
    <SideMarketsContext.Provider
      value={{
        onSymbolChange: props.onSymbolChange,
      }}
    >
      {props.children}
    </SideMarketsContext.Provider>
  );
};

export function useSideMarketsContext() {
  return useContext(SideMarketsContext);
}
