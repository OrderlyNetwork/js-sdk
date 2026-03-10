import { useMemo } from "react";
import { MarginMode } from "@orderly.network/types";
import { usePositionStream } from "../../orderly/orderlyHooks";

const useEstLiqPriceBySymbol = (
  symbol: string,
  marginMode: MarginMode,
): number | undefined => {
  const [data] = usePositionStream(symbol);
  const position = data?.rows?.find(
    (row) => row.symbol === symbol && row.margin_mode === marginMode,
  );
  return useMemo(() => {
    return position?.est_liq_price ?? undefined;
  }, [position]);
};

export { useEstLiqPriceBySymbol };
