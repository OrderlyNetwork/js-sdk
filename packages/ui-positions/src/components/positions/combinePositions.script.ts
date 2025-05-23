import React from "react";
import {
  useAccount,
  usePositionStream,
  usePrivateQuery,
} from "@orderly.network/hooks";
import { useDataTap } from "@orderly.network/react-app";
import type { API } from "@orderly.network/types";
import { usePagination } from "@orderly.network/ui";
import type { PositionsProps } from "../../types/types";

export const useCombinePositionsScript = (props: PositionsProps) => {
  const {
    symbol,
    pnlNotionalDecimalPrecision,
    sharePnLConfig,
    calcMode,
    includedPendingOrder,
    onSymbolChange,
  } = props;

  const { pagination, setPage } = usePagination({ pageSize: 50 });

  React.useEffect(() => {
    setPage(1);
  }, [symbol]);

  const [oldPositions, , { isLoading }] = usePositionStream(symbol, {
    calcMode,
    includedPendingOrder,
  });

  const { data: newPositions, isLoading: isPositionLoading } =
    usePrivateQuery<API.PositionInfo>("/v1/client/aggregate/positions", {
      formatter: (data) => data,
      errorRetryCount: 3,
    });

  const dataSource = useDataTap(
    [...(oldPositions?.rows ?? []), ...(newPositions?.rows ?? [])],
    { fallbackData: [] },
  );

  const { state } = useAccount();

  const memoizedDataSource = React.useMemo(() => {
    if (!Array.isArray(dataSource)) {
      return [];
    }
    return dataSource.map((item) => {
      const isMainAccount = item.account_id === state.mainAccountId;
      if (isMainAccount) {
        return {
          id: item?.account_id,
          description: "Main account",
          symbol: "main_account",
          children: [item],
        };
      } else {
        return {
          id: item?.account_id,
          description: "Sub account",
          symbol: "sub_account",
          children: [item],
        };
      }
    });
  }, [dataSource, state.subAccounts, state.mainAccountId]);

  return {
    dataSource: [],
    isLoading: isLoading || isPositionLoading,
    pnlNotionalDecimalPrecision,
    sharePnLConfig,
    symbol,
    onSymbolChange,
    pagination,
  };
};

export type CombinePositionsState = ReturnType<
  typeof useCombinePositionsScript
>;
