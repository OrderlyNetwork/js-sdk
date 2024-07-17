import {
  FC,
  createContext,
  PropsWithChildren,
  useState,
  useContext,
  useCallback,
} from "react";

type MarketsContextState = {
  searchValue?: string;
  onSearchValueChange?: (searchValue: string) => void;
  clearSearchValue?: () => void;
};

export const MarketsContext = createContext({} as MarketsContextState);

export const MarketsProvider: FC<PropsWithChildren<any>> = (props) => {
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
      }}
    >
      {props.children}
    </MarketsContext.Provider>
  );
};

export function useMarketsContext() {
  return useContext(MarketsContext);
}
