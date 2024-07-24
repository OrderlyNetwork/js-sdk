import { useMemo } from "react";
import { useTradingRewardsContext } from "../provider";
import { EpochInfoItem, WalletRewardsItem } from "@orderly.network/hooks";
import { usePagination } from "@orderly.network/ui";

export type ListType = EpochInfoItem & {
  info?: WalletRewardsItem;
  state?: string;
};

export type RewardsHistoryReturns = {
  data: ListType[];
  meta: {
    count: number;
    page: number;
    pageSize: number;
    pageTotal: number;
  };
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export const useRewardsHistoryScript = (): RewardsHistoryReturns => {
  const { epochList, walletRewardsHistory, totalOrderClaimedReward } =
    useTradingRewardsContext();
  const epochInfos = epochList?.[0];
  const { isUnstart } = epochList?.[1];
  const [history] = walletRewardsHistory;

  const data = useMemo(() => {
    if (isUnstart) return [];
    const list = [...(epochInfos || [])];

    const combineData = list.map((e): ListType => {
      const id = e.epoch_id;
      const index = history?.rows.findIndex((info) => id === info.epoch_id);

      if (index !== -1) {
        return {
          ...e,
          info: history?.rows?.[index as number],
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
    const curDate = Date.now();
    return combineData.filter((item) => item.end_time <= curDate);
  }, [history, epochInfos, totalOrderClaimedReward, isUnstart]);

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
    meta: meta,
    onPageChange,
    onPageSizeChange,
  };
};
