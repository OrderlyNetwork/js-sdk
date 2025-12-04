import React from "react";
import { usePositionStream } from "@veltodefi/hooks";
import { useDataTap } from "@veltodefi/react-app";
import { usePagination } from "@veltodefi/ui";
import { TRADING_POSITIONS_SORT_STORAGE_KEY } from "../../constants";
import type { PositionsProps } from "../../types/types";
import { useSort } from "../../utils/sorting";
import { useTabSort, PositionsTabName } from "../shared/hooks/useTabSort";

export const usePositionsScript = (props: PositionsProps) => {
  const {
    symbol,
    calcMode,
    includedPendingOrder,
    pnlNotionalDecimalPrecision,
    sharePnLConfig,
    onSymbolChange,
    enableSortingStorage = true, // Default to true for backward compatibility
  } = props;
  // const [showAllSymbol] = useLocalStorage(
  //   "showAllSymbol",
  //   true
  // );
  const { pagination, setPage } = usePagination({ pageSize: 50 });

  // Sorting functionality
  const { tabSort, onTabSort } = useTabSort({
    storageKey: TRADING_POSITIONS_SORT_STORAGE_KEY,
  });

  const { onSort, getSortedList, sort } = useSort(
    enableSortingStorage ? tabSort?.[PositionsTabName.Positions] : undefined,
    enableSortingStorage ? onTabSort(PositionsTabName.Positions) : undefined,
  );

  React.useEffect(() => {
    setPage(1);
  }, [symbol]);

  const [data, , { isLoading }] = usePositionStream(symbol, {
    calcMode,
    includedPendingOrder,
  });

  const rawDataSource =
    useDataTap(data?.rows, { fallbackData: [] }) ?? undefined;
  const dataSource = getSortedList(rawDataSource || []);

  return {
    dataSource,
    isLoading, // will be use isLoading when usePositionStream support
    pnlNotionalDecimalPrecision,
    sharePnLConfig,
    symbol,
    onSymbolChange,
    pagination,
    onSort,
    initialSort: enableSortingStorage
      ? tabSort?.[PositionsTabName.Positions]
      : undefined,
  };
};

export type PositionsState = ReturnType<typeof usePositionsScript>;
