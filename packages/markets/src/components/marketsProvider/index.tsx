import {
  FC,
  createContext,
  PropsWithChildren,
  useState,
  useContext,
  useCallback,
} from "react";
import { API } from "@orderly.network/types";
import { LeftNavProps, RouterAdapter } from "@orderly.network/ui-scaffold";

type MarketsContextState = {
  symbol?: string;
  searchValue?: string;
  onSearchValueChange?: (searchValue: string) => void;
  clearSearchValue?: () => void;
} & MarketsProviderProps;

export const MarketsContext = createContext({} as MarketsContextState);

export type MarketsProviderProps = {
  symbol?: string;
  onSymbolChange?: (symbol: API.Symbol) => void;
  // only for mobile
  navProps?: {
    logo?: {
      src: string;
      alt: string;
    };
    routerAdapter?: RouterAdapter;
    leftNav?: LeftNavProps;
  };
};

export const MarketsProvider: FC<PropsWithChildren<MarketsProviderProps>> = (
  props,
) => {
  const [searchValue, setSearchValue] = useState("");

  const clearSearchValue = useCallback(() => {
    setSearchValue("");
  }, []);

  return (
    <MarketsContext.Provider
      value={{
        searchValue,
        onSearchValueChange: setSearchValue,
        clearSearchValue,
        symbol: props.symbol,
        onSymbolChange: props.onSymbolChange,
      }}
    >
      {props.children}
    </MarketsContext.Provider>
  );
};

export function useMarketsContext() {
  return useContext(MarketsContext);
}
