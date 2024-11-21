import { useMemo } from "react";
import { useTradingRewardsContext } from "../provider";
import {
  EpochInfoItem,
  useAccount,
  useAccountRewardsHistory,
  WalletRewardsItem,
} from "@orderly.network/hooks";
import { usePagination } from "@orderly.network/ui";
import { useAppContext } from "@orderly.network/react-app";
import { RewardsTooltipProps } from "../curEpoch/rewardsTooltip";
import { getTimestamp } from "@orderly.network/utils";

export type ListType = EpochInfoItem & {
  info?: WalletRewardsItem;
  state?: string;
  rewardsTooltip?: RewardsTooltipProps;
};

export type RewardsHistoryReturns = {
  data: ListType[];
  originalData: ListType[];
  meta: {
    count: number;
    page: number;
    pageSize: number;
    pageTotal: number;
  };
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isLoading: boolean;
};

export const useRewardsHistoryScript = (): RewardsHistoryReturns => {
  const { account } = useAccount();
  const {
    epochList,
    walletRewardsHistory,
    totalOrderClaimedReward,
    brokerId,
    brokerName,
  } = useTradingRewardsContext();
  const epochInfos = epochList?.[0];
  const { isNotStared } = epochList?.[1];
  const [history] = walletRewardsHistory;
  const { wrongNetwork } = useAppContext();

  const { data: accountHistory } = useAccountRewardsHistory(account.address);

  const data = useMemo(() => {
    if (isNotStared) return [];
    const list = [...(epochInfos || [])];

    const combineData = list.map((e): ListType => {
      const id = e.epoch_id;
      const index = history?.rows.findIndex((info) => id === info.epoch_id);

      let rewardsTooltip: RewardsTooltipProps | undefined = undefined;

      if (index !== -1 && !wrongNetwork) {
        const info = history?.rows?.[index as number];
        const _findIndex = accountHistory?.findIndex((item: any) => {
          return item?.epoch_id === e.epoch_id;
        });

        if (
          accountHistory !== undefined &&
          _findIndex !== undefined &&
          _findIndex !== -1
        ) {
          // get broker
          const brokerList = accountHistory[_findIndex].broker;
          const curBrokerIndex = brokerList.findIndex(
            (item) => item.broker_id === brokerId
          );
          const curBroker =
            curBrokerIndex !== -1 ? brokerList[curBrokerIndex] : undefined;
          const curRewards = curBroker?.r_account ?? 0;
          const otherRewards = Math.max(0, (info?.r_wallet ?? 0) - curRewards);
          rewardsTooltip = {
            brokerName,
            curRewards,
            otherRewards,
          };
        }
        return {
          ...e,
          info,
          rewardsTooltip,
        } as ListType;
      }
      return {
        ...e,
      } as ListType;
    });

    combineData.sort((a, b) => a.epoch_id - b.epoch_id); // asc
    let [claimedReward] = totalOrderClaimedReward;
    if (typeof claimedReward !== "undefined") {
      for (let i = 0; i < combineData.length; i++) {
        const element = combineData[i];
        if (typeof element?.info === "undefined") {
          element.state = "Null";
          continue;
        }
        const status = element.info?.reward_status;
        if (status === "Confirmed") {
          if (claimedReward - element.info?.r_wallet >= 0) {
            element.state = "Claimed";
          } else {
            element.state = "Claimable";
          }
          claimedReward -= element.info?.r_wallet;
        } else if (status === "Pending") {
          element.state = "Processing";
        }
      }
    }
    combineData.sort((a, b) => b.epoch_id - a.epoch_id);
    const curDate = getTimestamp();
    return combineData.filter((item) => item.end_time <= curDate);
  }, [
    history,
    epochInfos,
    totalOrderClaimedReward,
    isNotStared,
    wrongNetwork,
    accountHistory,
  ]);

  const { page, pageSize, setPage, setPageSize, parseMeta } = usePagination();

  const totalCount = useMemo(() => data.length, [data]);
  const onPageChange = (page: number) => {
    setPage(page);
  };

  const onPageSizeChange = (pageSize: number) => {
    setPageSize(pageSize);
  };

  const newData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, page, pageSize]);

  const meta = parseMeta({
    total: totalCount,
    current_page: page,
    records_per_page: pageSize,
  });

  return {
    data: newData,
    originalData: data,
    meta: meta,
    onPageChange,
    onPageSizeChange,
    isLoading: epochList[1].isLoading,
  };
};
