import { useMemo } from "react";
import { usePositionStream } from "../../orderly/orderlyHooks";

const useEstLiqPriceBySymbol = (symbol: string): number | undefined => {
  const [data] = usePositionStream(symbol);
  const position = data?.rows?.find((row) => row.symbol === symbol);
  return useMemo(() => {
    return position?.est_liq_price ?? undefined;
  }, [position]);
};

export { useEstLiqPriceBySymbol };
