import { useMemo } from "react";
import { useTradingRewardsContext } from "../provider";
import { EpochInfoItem, WalletRewardsItem } from "@orderly.network/hooks";

export type ListType = EpochInfoItem & { info?: WalletRewardsItem; state?: string };

export type RewardsHistoryReturns = {
    data: ListType[]
};

export const useRewardsHistoryScript = (): RewardsHistoryReturns => {

    const { epochList, walletRewardsHistory, totalOrderClaimedReward } = useTradingRewardsContext();
    const { data: epochInfos, isUnstart } = epochList;
    const { data: history } = walletRewardsHistory;

    console.log("xxx epochInfos", epochInfos);
    

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
        let { data: claimedReward } = totalOrderClaimedReward;
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

      console.log("xxxxxx data", data);
      

    return {
        data,
    };
};