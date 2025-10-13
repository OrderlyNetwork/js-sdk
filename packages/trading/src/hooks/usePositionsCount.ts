import { useMemo } from "react";
import { usePositionStream } from "@kodiak-finance/orderly-hooks";
import { useDataTap } from "@kodiak-finance/orderly-react-app";
import { useTradingLocalStorage } from "./useTradingLocalStorage";

export const usePositionsCount = (symbol?: string) => {
  const { showAllSymbol } = useTradingLocalStorage();
  const [data] = usePositionStream(showAllSymbol ? undefined : symbol);

  const count = useMemo(() => {
    return data.rows?.length;
  }, [data.rows?.length]);

  const positionCount = useDataTap(count) ?? 0;

  return {
    positionCount,
  };
};
