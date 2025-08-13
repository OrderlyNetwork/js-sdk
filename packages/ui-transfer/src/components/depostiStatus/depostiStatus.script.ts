import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useAssetsHistory,
  useBalanceTopic,
  useDebouncedCallback,
  useTransferHistory,
  useWalletTopic,
} from "@orderly.network/hooks";
import {
  AccountStatusEnum,
  API,
  AssetHistorySideEnum,
  AssetHistoryStatusEnum,
} from "@orderly.network/types";
import { useTransactionTime } from "../../contract/useTransactionTime";

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
  const [pendingList, setPendingList] = useState<API.TransferHistoryRow[]>([]);

  const { state } = useAccount();

  const canTrade =
    state.status === AccountStatusEnum.EnableTrading ||
    state.status === AccountStatusEnum.EnableTradingWithoutConnected;

  const { chainId, blockTime } = useMemo(() => {
    if (canTrade && pendingList.length === 1) {
      return {
        chainId: pendingList[0].chain_id,
        blockTime: pendingList[0].block_time,
      };
    }

    return {
      chainId: undefined,
      blockTime: undefined,
    };
  }, [canTrade, pendingList]);

  const transactionTime = useTransactionTime(chainId);

  // Estimated time remaining = tx_block_time +(total confirmations x average block time) - current time
  const estimatedTime = useMemo(() => {
    if (transactionTime && blockTime) {
      const seconds = blockTime / 1000 + transactionTime - Date.now() / 1000;
      return formatEstimatedTime(seconds);
    }

    return 0;
  }, [transactionTime, blockTime]);

  const [assetHistory, { isLoading }] = useAssetsHistory(
    {
      startTime: depositDataRange[0],
      endTime: depositDataRange[1],
      page: 1,
      pageSize: 200,
      side: "DEPOSIT",
    },
    {
      shouldUpdateOnWalletChanged: () => false,
    },
  );

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

  useWalletTopic({
    onMessage(data) {
      const { side, transStatus } = data;
      if (
        side === AssetHistorySideEnum.DEPOSIT &&
        (transStatus === AssetHistoryStatusEnum.PENDING ||
          transStatus === AssetHistoryStatusEnum.COMPLETED)
      ) {
        console.log("deposit status updated", data);
        updateDepositTimeRange();
      }
    },
  });

  useBalanceTopic({
    onMessage(data) {
      console.log("balance updated", data);
      // update transfer time range when balance changed
      setTransferDataRange(getTimeRange());
    },
  });

  // useEffect(() => {
  //   // update deposit time range when deposit requested
  //   const handler = (data: any) => {
  //     updateDepositTimeRange();
  //   };

  //   ee.on("deposit:requested", handler);

  //   return () => {
  //     ee.off("deposit:requested");
  //   };
  // }, []);

  useEffect(() => {
    if (!assetHistory || isLoading) {
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
    setPendingList(pendingList || []);
  }, [assetHistory, isLoading]);

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
    canTrade,
    estimatedTime,
  };
}

function formatEstimatedTime(totalSeconds: number) {
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;

  if (seconds > 0 && seconds <= 30) {
    seconds = 30;
  } else if (seconds > 30) {
    minutes += 1;
    seconds = 0;
  }

  if (minutes > 0) {
    return seconds > 0 ? `${minutes} m ${seconds} s` : `${minutes} m`;
  }

  return `${seconds} s`;

  // minutes = Math.max(1, Math.ceil(seconds / 60));
}
