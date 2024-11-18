import {
  PriceMode,
  useLocalStorage,
  usePositionStream,
} from "@orderly.network/hooks";
import { PositionsProps } from "../types/types";
import { useDataTap } from "@orderly.network/react-app";
import { PaginationMeta, usePagination } from "@orderly.network/ui";
import { useMemo } from "react";

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
  const { page, pageSize, setPage, setPageSize } = usePagination({
    pageSize: 50,
  });

  const [data, info, { isLoading }] = usePositionStream(symbol, {
    calcMode,
    includedPendingOrder,
  });

  const dataSource = useDataTap(data?.rows) ?? undefined;

  const pagination = useMemo(
    () =>
      ({
        page,
        pageSize,
        count: dataSource?.length,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
      } as PaginationMeta),
    [page, pageSize, setPage, setPageSize, dataSource]
  );

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
