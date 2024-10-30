import {
  PriceMode,
  useLocalStorage,
  usePositionStream,
} from "@orderly.network/hooks";
import { PositionsProps } from "../types/types";
import { useDataTap } from "@orderly.network/react-app";

export const usePositionsBuilder = (props: PositionsProps) => {
  const {
    symbol,
    calcMode,
    includedPendingOrder,
    pnlNotionalDecimalPrecision,
    sharePnLConfig,
    onSymbolChange,
  } = props;
  // const [showAllSymbol] = useLocalStorage(
  //   "showAllSymbol",
  //   true
  // );
  const [data, info, { isLoading }] = usePositionStream(symbol, {
    calcMode,
    includedPendingOrder,
  });

  const dataSource = useDataTap(data?.rows) ?? undefined;

  return {
    dataSource,
    isLoading, // will be use isLoading when usePositionStream support
    pnlNotionalDecimalPrecision,
    sharePnLConfig,

    symbol,
    onSymbolChange,
  };
};

export type PositionsBuilderState = ReturnType<typeof usePositionsBuilder>;
