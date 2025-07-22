import { useEffect, useState } from "react";
import {
  useAssetsHistory,
  useBalanceSubscription,
  useDebouncedCallback,
  useEventEmitter,
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
  const startTime = endTime - 1000 * 60 * 60;
  return {
    startTime,
    endTime,
  };
}

export function useDepositStatusScript() {
  const [pendingCount, setPendingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [dataRange, setDataRange] = useState(getTimeRange());

  const ee = useEventEmitter();

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
  // because DEPOSIT and WITHDRAW will push twice COMPLETED event in a shorttime, so we need to debounce it
  const updateTimeRange = useDebouncedCallback((data: any) => {
    setDataRange(getTimeRange());
  }, 300);

  useEffect(() => {
    const handler = (data: any) => {
      updateTimeRange(data);
    };

    ee.on("deposit:requested", handler);

    ee.on("deposit:requested", handler);

    return () => {
      ee.off("deposit:requested");
    };
  }, []);

  useBalanceSubscription({
    onMessage: updateTimeRange,
  });

  useWalletSubscription({
    onMessage: (data) => {
      const { side, transStatus } = data;
      if (side === "DEPOSIT" && transStatus === "COMPLETED") {
        updateTimeRange(data);
      }
    },
  });

  useEffect(() => {
    if (!assetHistory || !transferMeta) {
      return;
    }

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
