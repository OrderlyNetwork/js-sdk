import { useEffect, useMemo } from "react";
import { produce } from "immer";
import {
  SubAccount,
  useAccount,
  usePositionStream,
  usePrivateQuery,
  useSymbolsInfo,
} from "@orderly.network/hooks";
import { i18n } from "@orderly.network/i18n";
import { positions, account as _account } from "@orderly.network/perp";
import { useDataTap } from "@orderly.network/react-app";
import type { API } from "@orderly.network/types";
import { formatAddress, usePagination } from "@orderly.network/ui";
import type { PositionsProps } from "../../types/types";
import { useSubAccountQuery } from "./hooks/useSubAccountQuery";

export enum AccountType {
  ALL = "All accounts",
  MAIN = "Main accounts",
}

export const useCombinePositionsScript = (props: PositionsProps) => {
  const {
    symbol,
    calcMode,
    includedPendingOrder,
    pnlNotionalDecimalPrecision,
    sharePnLConfig,
    onSymbolChange,
    selectedAccount,
  } = props;

  const { pagination, setPage } = usePagination({ pageSize: 50 });

  useEffect(() => {
    setPage(1);
  }, [symbol]);

  const symbolsInfo = useSymbolsInfo();

  const { state } = useAccount();

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

  const processPositions = produce<API.PositionTPSLExt[]>(
    newPositions,
    (draft) => {
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
        const unrealPnl = positions.unrealizedPnL({
          qty: item.position_qty,
          openPrice: item?.average_open_price,
          // markPrice: unRealizedPrice,
          markPrice: item.mark_price,
        });
        const imr = _account.IMR({
          maxLeverage: account?.max_leverage ?? 1,
          baseIMR: info?.("base_imr"),
          IMR_Factor: account?.imr_factor[item.symbol] ?? 0,
          positionNotional: notional,
          ordersNotional: 0,
          IMR_factor_power: 4 / 5,
        });
        const unrealPnlROI = positions.unrealizedPnLROI({
          positionQty: item.position_qty,
          openPrice: item.average_open_price,
          IMR: imr,
          unrealizedPnL: unrealPnl,
        });
        let unrealPnl_index = 0;
        let unrealPnlROI_index = 0;
        if (item.index_price) {
          unrealPnl_index = positions.unrealizedPnL({
            qty: item.position_qty,
            openPrice: item?.average_open_price,
            // markPrice: unRealizedPrice,
            markPrice: item.index_price,
          });
          unrealPnlROI_index = positions.unrealizedPnLROI({
            positionQty: item.position_qty,
            openPrice: item.average_open_price,
            IMR: imr,
            unrealizedPnL: unrealPnl_index,
          });
        }
        item.mmr = MMR;
        item.mm = mm;
        item.notional = notional;
        item.unrealized_pnl = unrealPnl;
        item.unrealized_pnl_ROI = unrealPnlROI;
        item.unrealized_pnl_ROI_index = unrealPnlROI_index;
      }

      // delete main account position
      const idx = draft.findIndex(
        (acc) => acc.account_id === state.mainAccountId,
      );
      if (idx !== -1) {
        draft.splice(idx, 1);
      }
    },
  );

  const dataSource =
    useDataTap(
      [...oldPositions?.rows, ...processPositions].filter(
        (acc) => acc.position_qty !== 0,
      ),
    ) ?? [];

  const filtered = useMemo(() => {
    if (!selectedAccount || selectedAccount === AccountType.ALL) {
      return dataSource;
    }
    return dataSource.filter((item) => {
      if (selectedAccount === AccountType.MAIN) {
        return item.account_id === state.mainAccountId;
      } else {
        return item.account_id === selectedAccount;
      }
    });
  }, [dataSource, selectedAccount]);

  const groupDataSource = useMemo(() => {
    return groupDataByAccount(filtered, {
      mainAccountId: state.mainAccountId,
      subAccounts: state.subAccounts,
    });
  }, [filtered, state.mainAccountId, state.subAccounts]);

  const mergedLoading = useMemo<boolean>(() => {
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

export const groupDataByAccount = (
  data: API.PositionExt[],
  options: {
    mainAccountId?: string;
    subAccounts?: SubAccount[];
  },
) => {
  const { mainAccountId = "", subAccounts = [] } = options;

  const map = new Map<
    PropertyKey,
    {
      id: string;
      description: string;
      children: API.PositionExt[];
    }
  >();

  for (const item of data) {
    // if account_id is not set, as a main account
    const accountId = item.account_id || mainAccountId;
    const findSubAccount = subAccounts.find((acc) => acc.id === accountId);
    if (map.has(accountId)) {
      map.get(accountId)?.children?.push(item);
    } else {
      map.set(accountId, {
        id: accountId,
        description:
          accountId === mainAccountId
            ? i18n.t("common.mainAccount")
            : findSubAccount?.description ||
              formatAddress(findSubAccount?.id || ""),
        children: [item],
      });
    }
  }
  return {
    expanded: Array.from(map.keys()),
    dataSource: Array.from(map.values()),
  };
};
