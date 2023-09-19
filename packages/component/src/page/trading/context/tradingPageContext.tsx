import { API } from "@orderly.network/types";
import React, { PropsWithChildren, useMemo } from "react";
import { usePrivateQuery } from "@orderly.network/hooks";

export interface TradingPageContextValue {
  onSymbolChange?: (symbol: API.Symbol) => void;
  symbol: string;

  positionCount: number;
  pendingCount: number;
}

export const TradingPageContext = React.createContext<TradingPageContextValue>(
  {} as TradingPageContextValue
);

export interface TradingPageProviderProps {
  onSymbolChange?: (symbol: API.Symbol) => void;
  symbol: string;
}

export const TradingPageProvider: React.FC<
  PropsWithChildren<TradingPageProviderProps>
> = ({ children, onSymbolChange, symbol }) => {
  const { data: positions } = usePrivateQuery("/v1/positions");
  const { data: pendings } = usePrivateQuery(
    "/v1/orders?size=100&page=1&status=NEW",
    {
      formatter: (data: any) => data?.meta?.total ?? 0,
    }
  );

  // const [] = useOrderStream();

  const positionCount = useMemo(() => {
    if (!positions || !positions.rows) return 0;
    return positions.rows.filter(
      (item: API.Position) => item.position_qty !== 0
    ).length;
  }, [positions]);

  const pendingCount = useMemo(() => {
    if (!pendings) return 0;
    return pendings;
  }, [pendings]);

  return (
    <TradingPageContext.Provider
      value={{ onSymbolChange, symbol, positionCount, pendingCount }}
    >
      {children}
    </TradingPageContext.Provider>
  );
};
