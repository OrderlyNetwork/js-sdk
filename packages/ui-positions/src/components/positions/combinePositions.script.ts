import React from "react";
import { produce } from "immer";
import {
  usePositionStream,
  usePrivateQuery,
  useSymbolsInfo,
} from "@orderly.network/hooks";
import { positions } from "@orderly.network/perp";
import { useDataTap } from "@orderly.network/react-app";
import type { API } from "@orderly.network/types";
import { usePagination } from "@orderly.network/ui";
import type { PositionsProps } from "../../types/types";
import { useDataSourceGroupByAccount } from "./hooks/useDataSourceGroupByAccount";
import { useSubAccountQuery } from "./hooks/useSubAccountQuery";

export const useCombinePositionsScript = (props: PositionsProps) => {
  const {
    symbol,
    calcMode,
    includedPendingOrder,
    pnlNotionalDecimalPrecision,
    sharePnLConfig,
    onSymbolChange,
  } = props;

  const { pagination, setPage } = usePagination({ pageSize: 50 });

  React.useEffect(() => {
    setPage(1);
  }, [symbol]);

  const symbolsInfo = useSymbolsInfo();

  const [oldPositions, , { isLoading }] = usePositionStream(symbol, {
    calcMode,
    includedPendingOrder,
  });

  // need to get sub account Positions info to calculate portfolio and positions
  const { data: newPositions = [], isLoading: isPositionLoading } =
    usePrivateQuery<API.PositionExt[]>("/v1/client/aggregate/positions", {
      // formatter: (data) => data,
      errorRetryCount: 3,
    });

  // need to get sub account info to calculate portfolio and positions
  const { data: accountInfo = [], isLoading: isAccountInfoLoading } =
    useSubAccountQuery<API.AccountInfo[]>("/v1/client/info", {
      accountId: newPositions.map((item) => item.account_id!),
    });

  const processPositions = produce<API.PositionExt[]>(newPositions, (draft) => {
    for (const item of draft) {
      const info = symbolsInfo[item.symbol];
      const notional = positions.notional(item.position_qty, item.mark_price);
      const account = accountInfo.find(
        (acc) => acc.account_id === item.account_id,
      );
      const MMR = positions.MMR({
        baseMMR: info?.("base_mmr"),
        baseIMR: info?.("base_imr"),
        IMRFactor: account?.imr_factor[item.symbol] ?? 0,
        positionNotional: notional,
        IMR_factor_power: 4 / 5,
      });
      const mm = positions.maintenanceMargin({
        positionQty: item.position_qty,
        markPrice: item.mark_price,
        MMR: MMR,
      });
      item.mmr = MMR;
      item.mm = mm;
      item.notional = notional;
    }
  });

  const dataSource = useDataTap(
    [...oldPositions?.rows, ...processPositions].filter(
      (acc) => acc.position_qty !== 0,
    ),
  );

  const groupDataSource = useDataSourceGroupByAccount(dataSource ?? []);

  const mergedLoading = React.useMemo<boolean>(() => {
    return isLoading || isPositionLoading || isAccountInfoLoading;
  }, [isLoading, isPositionLoading, isAccountInfoLoading]);

  return {
    tableData: groupDataSource,
    isLoading: mergedLoading,
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
