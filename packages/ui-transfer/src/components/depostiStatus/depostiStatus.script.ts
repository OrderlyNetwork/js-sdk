import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useAssetsHistory,
  useBalanceSubscription,
  useDebouncedCallback,
  useEventEmitter,
  useTransferHistory,
  useWalletSubscription,
} from "@orderly.network/hooks";
import {
  AccountStatusEnum,
  AssetHistoryStatusEnum,
} from "@orderly.network/types";

export type DepositStatusScriptReturn = ReturnType<
  typeof useDepositStatusScript
>;

function getTimeRange() {
  const endTime = Date.now();
  // 1 hour ago
  const startTime = endTime - 1000 * 60 * 60;

  return [startTime, endTime];
}

export function useDepositStatusScript() {
  const [depositDataRange, setDepositDataRange] = useState(getTimeRange());
  const [transferDataRange, setTransferDataRange] = useState(getTimeRange());
  // only deposit have pending status
  const [depositPending, setDepositPending] = useState(0);
  const [depositCompleted, setDepositCompleted] = useState(0);
  const [transferCompleted, setTransferCompleted] = useState(0);

  const ee = useEventEmitter();
  const { state } = useAccount();

  const isSignIn =
    state.status === AccountStatusEnum.EnableTrading ||
    state.status === AccountStatusEnum.EnableTradingWithoutConnected;

  const [assetHistory] = useAssetsHistory({
    startTime: depositDataRange[0],
    endTime: depositDataRange[1],
    page: 1,
    pageSize: 200,
    side: "DEPOSIT",
  });

  // pending and completed use one request to reduce api request
  const [_, { meta: transferMeta }] = useTransferHistory({
    dataRange: transferDataRange,
    side: "IN",
    size: 100,
    page: 1,
    main_sub_only: false,
  });

  // update time range when wallet and balance changed
  // because DEPOSIT and WITHDRAW will push twice COMPLETED event in a shorttime, so we need to debounce it
  const updateDepositTimeRange = useDebouncedCallback(() => {
    setDepositDataRange(getTimeRange());
  }, 300);

  useEffect(() => {
    // update deposit time range when deposit requested
    const handler = (data: any) => {
      updateDepositTimeRange();
    };

    ee.on("deposit:requested", handler);

    ee.on("deposit:requested", handler);

    return () => {
      ee.off("deposit:requested");
    };
  }, []);

  useWalletSubscription({
    onMessage: (data) => {
      const { side, transStatus } = data;
      // when transStatus === "PENDING", thre api not update data
      if (side === "DEPOSIT" && transStatus === "COMPLETED") {
        updateDepositTimeRange();
      }
    },
  });

  useBalanceSubscription({
    onMessage: () => {
      // update transfer time range when balance changed
      setTransferDataRange(getTimeRange());
    },
  });

  useEffect(() => {
    if (!assetHistory) {
      return;
    }
    const pendingList = assetHistory?.filter(
      (item) => item.trans_status === AssetHistoryStatusEnum.PENDING,
    );

    const completedList = assetHistory?.filter(
      (item) => item.trans_status === AssetHistoryStatusEnum.COMPLETED,
    );

    setDepositPending(pendingList?.length || 0);
    setDepositCompleted(completedList?.length || 0);
  }, [assetHistory]);

  useEffect(() => {
    if (!transferMeta) {
      return;
    }
    setTransferCompleted(transferMeta.total || 0);
  }, [transferMeta]);

  const completedCount = useMemo(() => {
    return depositCompleted + transferCompleted;
  }, [depositCompleted, transferCompleted]);

  return {
    pendingCount: depositPending,
    completedCount,
    isSignIn,
  };
}
