import React from "react";
import { produce } from "immer";
import {
  useAccount,
  usePositionStream,
  usePrivateQuery,
  useSymbolsInfo,
} from "@orderly.network/hooks";
import { positions } from "@orderly.network/perp";
import { useDataTap } from "@orderly.network/react-app";
import type { API } from "@orderly.network/types";
import { formatAddress, usePagination } from "@orderly.network/ui";
import type { PositionsProps } from "../../types/types";

interface Group {
  id: string;
  description: string;
  symbol: string;
  children: API.PositionExt[];
}

const useDataSourceGroupByAccount = (data: API.PositionExt[]) => {
  const {
    state: { mainAccountId = "", subAccounts = [] },
    isMainAccount,
  } = useAccount();
  const map = new Map<PropertyKey, Group>();
  for (const item of data) {
    const accountId = item.account_id || mainAccountId; // 如果没有 account_id，则视为主账号
    const findSubAccount = subAccounts.find((acc) => acc.id === accountId);
    if (map.has(accountId)) {
      map.get(accountId)?.children?.push(item);
    } else {
      map.set(accountId, {
        id: accountId,
        description: isMainAccount
          ? "Main Account"
          : findSubAccount?.description ||
            formatAddress(findSubAccount?.id!) ||
            "Sub Account",
        symbol: accountId,
        children: [item],
      });
    }
  }
  return {
    expanded: Array.from(map.keys()),
    dataSource: Array.from(map.values()),
  };
};

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

  const [oldPositions, , { isLoading }] = usePositionStream(symbol, {
    calcMode,
    includedPendingOrder,
  });

  const { data: newPositions = [], isLoading: isPositionLoading } =
    usePrivateQuery<API.PositionExt[]>("/v1/client/aggregate/positions", {
      // formatter: (data) => data,
      errorRetryCount: 3,
    });

  const symbolsInfo = useSymbolsInfo();

  // need to get sub account info to calculate portfolio and positions
  // const { data: accountInfo } = useSubAccountQuery<API.AccountInfo>(
  //   "/v1/client/info",
  //   {
  //     accountId: "",
  //   },
  // );

  const processPositions = produce<API.PositionExt[]>(newPositions, (draft) => {
    for (const item of draft) {
      const info = symbolsInfo[item.symbol];
      const notional = positions.notional(item.position_qty, item.mark_price);
      const MMR = positions.MMR({
        baseMMR: info?.("base_mmr"),
        baseIMR: info?.("base_imr"),
        IMRFactor: 1, // TODO: IMRFactor needs to be replaced with the real value
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

  const dataSource = useDataTap([...oldPositions?.rows, ...processPositions]);

  const groupDataSource = useDataSourceGroupByAccount(
    (dataSource ?? []).filter((acc) => acc.position_qty !== 0),
  );

  return {
    tableData: groupDataSource,
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
