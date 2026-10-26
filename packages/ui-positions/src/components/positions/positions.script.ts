import React from "react";
import { usePositionStream } from "@orderly.network/hooks";
import { useDataTap } from "@orderly.network/react-app";
import { usePagination } from "@orderly.network/ui";
import { isBinarySymbol } from "@orderly.network/utils";
import { TRADING_POSITIONS_SORT_STORAGE_KEY } from "../../constants";
import type { PositionsProps } from "../../types/types";
import { useSort } from "../../utils/sorting";
import { useReversePositionEnabled } from "../reversePosition";
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

  const { isEnabled: positionReverse } = useReversePositionEnabled();

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

  // /v1/positions mixes both products (api-spec §6.2); binary positions are
  // owned by the prediction UI and never render in the perps table.
  const rawDataSource =
    useDataTap(data?.rows, { fallbackData: [] })?.filter(
      (item) => !isBinarySymbol(item.symbol),
    ) ?? undefined;
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
    positionReverse,
    initialSort: enableSortingStorage
      ? tabSort?.[PositionsTabName.Positions]
      : undefined,
  };
};

export type PositionsState = ReturnType<typeof usePositionsScript>;
