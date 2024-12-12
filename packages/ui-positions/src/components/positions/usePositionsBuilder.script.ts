import { usePositionStream } from "@orderly.network/hooks";
import { PositionsProps } from "../../types/types";
import { useDataTap } from "@orderly.network/react-app";
import { usePagination } from "@orderly.network/ui";

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
  const { pagination } = usePagination({
    pageSize: 50,
  });

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
    pagination,
  };
};

export type PositionsBuilderState = ReturnType<typeof usePositionsBuilder>;
