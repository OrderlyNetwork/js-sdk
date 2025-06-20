import { useCallback, useMemo, useState } from "react";
import { getDate, getMonth, getYear, set } from "date-fns";
import {
  useAssetsHistory,
  useQuery,
  useTransferHistory,
} from "@orderly.network/hooks";
import { modal, usePagination } from "@orderly.network/ui";
import { DepositAndWithdrawWithSheetId } from "@orderly.network/ui-transfer";
import { subtractDaysFromCurrentDate } from "@orderly.network/utils";
import { parseDateRangeForFilter } from "../helper/date";

export type AssetSide = "deposit" | "withdraw";

export enum AssetTarget {
  Web3Wallet = "Web3Wallet",
  AccountId = "AccountId",
}

export type AssetHistoryScriptOptions = {
  side: AssetSide;
};

export type AssetHistoryScriptReturn = ReturnType<typeof useAssetHistoryScript>;

export const useAssetHistoryScript = (options: AssetHistoryScriptOptions) => {
  const { side } = options;
  const [today] = useState(() => {
    const d = new Date();
    return new Date(getYear(d), getMonth(d), getDate(d), 0, 0, 0);
  });
  const [target, setTarget] = useState<AssetTarget>(AssetTarget.Web3Wallet);

  const [dateRange, setDateRange] = useState<Date[]>([
    subtractDaysFromCurrentDate(90, today),
    today,
  ]);
  const { page, pageSize, setPage, parsePagination } = usePagination();

  const startTime = dateRange[0].getTime();
  const endTime = set(dateRange[1], {
    hours: 23,
    minutes: 59,
    seconds: 59,
    milliseconds: 0,
  }).getTime();

  const [withdrawData, { meta: withdrawMeta, isLoading: withdrawLoading }] =
    useAssetsHistory({
      startTime: startTime.toString(),
      endTime: endTime.toString(),
      page,
      pageSize,
      side: side.toUpperCase(),
    });

  const [transferData, { isLoading: transferLoading, meta: transferMeta }] =
    useTransferHistory({
      dataRange: [startTime, endTime],
      side: side === "deposit" ? "IN" : "OUT",
      size: pageSize,
      page: page,
      main_sub_only: false,
    });

  const { data: chainsInfo } = useQuery("/v1/public/chain_info", {
    revalidateOnFocus: false,
  });

  const onFilter = (filter: { name: string; value: any }) => {
    if (filter.name === "dateRange") {
      setDateRange(parseDateRangeForFilter(filter.value));
      setPage(1);
    } else if (filter.name === "target") {
      setTarget(filter.value);
      setPage(1);
    }
  };

  const isLoading = useMemo(() => {
    if (target === AssetTarget.Web3Wallet) {
      return withdrawLoading;
    }
    return transferLoading;
  }, [target, withdrawLoading, transferLoading]);

  const meta = useMemo(() => {
    if (target === AssetTarget.Web3Wallet) {
      return withdrawMeta;
    }
    return transferMeta;
  }, [target, withdrawMeta, transferMeta]);

  const pagination = useMemo(
    () => parsePagination(meta),
    [parsePagination, meta],
  );

  const dataSource = useMemo(() => {
    if (target === AssetTarget.Web3Wallet) {
      return withdrawData;
    }
    return transferData;
  }, [target, withdrawData, transferData]);

  const onDeposit = useCallback(() => {
    modal.show(DepositAndWithdrawWithSheetId, { activeTab: "deposit" });
  }, []);

  const isDeposit = side === "deposit";
  const isWeb3Wallet = target === AssetTarget.Web3Wallet;

  return {
    dataSource,
    total: meta?.total,
    isLoading,
    queryParameter: {
      dateRange,
    },
    onFilter,
    pagination,
    side,
    target,
    onDeposit,
    chainsInfo: chainsInfo as any[],
    isDeposit,
    isWeb3Wallet,
  };
};
