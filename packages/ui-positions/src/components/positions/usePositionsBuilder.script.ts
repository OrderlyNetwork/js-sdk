import { usePositionStream } from "@orderly.network/hooks";
import { PositionsProps } from "../../types/types";
import { useDataTap } from "@orderly.network/react-app";
import { usePagination } from "@orderly.network/ui";
import { useEffect } from "react";

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
  const { pagination, setPage } = usePagination({
    pageSize: 50,
  });

  const [data, info, { isLoading }] = usePositionStream(symbol, {
    calcMode,
    includedPendingOrder,
  });

  useEffect(() => {
    setPage(1);
  }, [symbol]);

  const dataSource =
    useDataTap(data?.rows, {
      fallbackData: [],
    }) ?? undefined;

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
