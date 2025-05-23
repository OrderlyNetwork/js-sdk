import React from "react";
import { usePositionStream } from "@orderly.network/hooks";
import { useDataTap } from "@orderly.network/react-app";
import { usePagination } from "@orderly.network/ui";
import { PositionsProps } from "../../types/types";

export const usePositionsScript = (props: PositionsProps) => {
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
  const { pagination, setPage } = usePagination({ pageSize: 50 });

  React.useEffect(() => {
    setPage(1);
  }, [symbol]);

  const [data, , { isLoading }] = usePositionStream(symbol, {
    calcMode,
    includedPendingOrder,
  });

  const dataSource = useDataTap(data?.rows, { fallbackData: [] }) ?? undefined;

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

export type PositionsState = ReturnType<typeof usePositionsScript>;
