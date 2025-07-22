import { useEffect, useMemo, useState } from "react";
import {
  useAssetsHistory,
  useBalanceSubscription,
  useDebouncedCallback,
  useTransferHistory,
  useWalletSubscription,
} from "@orderly.network/hooks";
import { AssetHistoryStatusEnum } from "@orderly.network/types";

export type DepositStatusScriptReturn = ReturnType<
  typeof useDepositStatusScript
>;

function getTimeRange() {
  const endTime = Date.now();
  // 1 hour ago
  // const startTime = endTime - 1000 * 60 * 60;
  const startTime = endTime - 1000 * 60 * 60 * 24 * 30;
  return {
    startTime,
    endTime,
  };
}

export function useDepositStatusScript() {
  const [pendingCount, setPendingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [dataRange, setDataRange] = useState(getTimeRange());

  const { startTime, endTime } = dataRange;

  const [assetHistory] = useAssetsHistory({
    startTime,
    endTime,
    page: 1,
    pageSize: 200,
    side: "DEPOSIT",
  });

  const [_, { meta: transferMeta }] = useTransferHistory({
    dataRange: [startTime, endTime],
    side: "IN",
    size: 100,
    page: 1,
    main_sub_only: false,
  });

  // update time range when wallet and balance changed
  const updateTimeRange = useDebouncedCallback((data: any) => {
    setDataRange(getTimeRange());
  }, 300);

  useBalanceSubscription({
    onMessage: updateTimeRange,
  });

  useWalletSubscription({
    onMessage: updateTimeRange,
  });

  useEffect(() => {
    if (!assetHistory || !transferMeta) {
      return;
    }

    console.log("assetHistory", assetHistory);
    console.log("transferMeta", transferMeta);

    const pendingList = assetHistory?.filter(
      (item) => item.trans_status === AssetHistoryStatusEnum.NEW,
    );

    const completedList = assetHistory?.filter(
      (item) => item.trans_status === AssetHistoryStatusEnum.COMPLETED,
    );

    setPendingCount(pendingList?.length || 0);
    setCompletedCount(
      (completedList?.length || 0) + (transferMeta?.total || 0),
    );
  }, [assetHistory, transferMeta]);

  return { pendingCount, completedCount };
}
