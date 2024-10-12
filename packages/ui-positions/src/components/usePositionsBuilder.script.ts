import { PriceMode, usePositionStream } from "@orderly.network/hooks";
import { PositionsProps } from "../types/types";

export const usePositionsBuilder = (props: PositionsProps) => {
  const {
    symbol,
    calcMode,
    includedPendingOrder,
    pnlNotionalDecimalPrecision,
    sharePnLConfig,
  } = props;
  const [data, info, { isLoading }] = usePositionStream(symbol, {
    calcMode,
    includedPendingOrder,
  });
  return {
    dataSource: data?.rows,
    isLoading,
    pnlNotionalDecimalPrecision,
    sharePnLConfig,
    symbol,
  };
};

export type PositionsBuilderState = ReturnType<typeof usePositionsBuilder>;
