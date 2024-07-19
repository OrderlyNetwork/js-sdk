import {
  FC,
  createContext,
  PropsWithChildren,
  useState,
  useContext,
  useCallback,
} from "react";
import { API } from "@orderly.network/types";

type MarketsContextState = {
  searchValue?: string;
  onSearchValueChange?: (searchValue: string) => void;
  clearSearchValue?: () => void;
} & MarketsProviderProps;

export const MarketsContext = createContext({} as MarketsContextState);

export type MarketsProviderProps = {
  onSymbolChange?: (symbol: API.Symbol) => void;
};

export const MarketsProvider: FC<PropsWithChildren<MarketsProviderProps>> = (
  props
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
