import { usePositionStream } from "@orderly.network/hooks";
import { useTradingLocalStorage } from "./useTradingLocalStorage";
import { useMemo } from "react";

export const usePositionsCount = (symbol?: string) => {
  const { showAllSymbol } = useTradingLocalStorage();
  const [data] = usePositionStream(showAllSymbol ? undefined : symbol);

  const positionCount = useMemo(() => {
    return data.rows?.length;
  }, [data.rows?.length]);

  return {
    positionCount
  }
};
