import {
  FC,
  createContext,
  PropsWithChildren,
  useState,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { API } from "@orderly.network/types";
import { LeftNavProps, RouterAdapter } from "@orderly.network/ui-scaffold";

type MarketsContextState = {
  symbol?: string;
  searchValue?: string;
  onSearchValueChange?: (searchValue: string) => void;
  clearSearchValue?: () => void;
} & MarketsProviderProps;

export const MarketsContext = createContext<MarketsContextState>({});

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
  comparisonProps?: {
    /**
     * Set Name of Exchanges in the comparison list.
     * @default 'Orderly'
     */
    exchangesName?: string;
    /**
     * Set Icon URL of Exchanges in the comparison list.
     * @default ""
     */
    exchangesIconSrc?: string;
  };
};

export const MarketsProvider: FC<PropsWithChildren<MarketsProviderProps>> = (
  props,
) => {
  const { symbol, comparisonProps, children, onSymbolChange } = props;
  const [searchValue, setSearchValue] = useState("");

  const clearSearchValue = useCallback(() => {
    setSearchValue("");
  }, []);

  const memoizedValue = useMemo<MarketsContextState>(() => {
    return {
      searchValue,
      onSearchValueChange: setSearchValue,
      clearSearchValue,
      symbol: symbol,
      onSymbolChange: onSymbolChange,
      comparisonProps: comparisonProps,
    };
  }, [searchValue, symbol, onSymbolChange, setSearchValue, comparisonProps]);

  return (
    <MarketsContext.Provider value={memoizedValue}>
      {children}
    </MarketsContext.Provider>
  );
};

export function useMarketsContext() {
  return useContext<MarketsContextState>(MarketsContext);
}
