import { createContext, PropsWithChildren, useContext } from "react";
import { useSymbolsInfo } from "@veltodefi/hooks";
import { API } from "@veltodefi/types";

export interface TPSLDetailContextState {
  base_dp: number;
  quote_dp: number;
  position: API.Position;
}

export const TPSLDetailContext = createContext({} as TPSLDetailContextState);

interface TPSLDetailProviderProps {
  symbol: string;
  position: API.Position;
}

export const TPSLDetailProvider = (
  props: PropsWithChildren<TPSLDetailProviderProps>,
) => {
  const symbolInfo = useSymbolsInfo()[props.symbol];
  return (
    <TPSLDetailContext.Provider
      value={{
        base_dp: symbolInfo("base_dp"),
        quote_dp: symbolInfo("quote_dp"),
        position: props.position,
      }}
    >
      {props.children}
    </TPSLDetailContext.Provider>
  );
};

export const useTPSLDetailContext = () => {
  return useContext(TPSLDetailContext);
};
