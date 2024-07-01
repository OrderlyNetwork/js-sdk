import { useCallback, useEffect, useMemo, useState } from "react";
import { TWType } from "./types";
import { useQuery } from "../useQuery";

export type EpochInfoItem = {
  epoch_id: number;
  start_time: number;
  end_time: number;
  // power_fees_paid_major: number;
  // power_fees_paid_alts: number;
  // power_staked_major: number;
  // power_staked_alts: number;
  epoch_token: string;
  max_reward_amount: number;
  // k_constant_major: number;
  // k_constant_alts: number;
};

export type EpochInfoType = {
  data: EpochInfoItem[] | undefined;
  curEpochInfo: EpochInfoItem | undefined;
  isUnstart: boolean;
  refresh: () => void;
};

export const useEpochInfo = (type: TWType): EpochInfoType => {
  const [data, setData] = useState<EpochInfoItem[] | undefined>(undefined);
  const [curEpochInfo, setCurEpochInfo] = useState<EpochInfoItem | undefined>(
    undefined
  );

  const path =
    type === TWType.normal
      ? "/v1/public/trading_rewards/epoch_info"
      : "/v1/public/market_making_rewards/epoch_info";
  const { data: epochInfo, error, mutate: refresh } = useQuery(path);

  useEffect(() => {
    if (
      typeof epochInfo === "object" &&
      "rows" in epochInfo! &&
      "current_epoch" in epochInfo
    ) {
      const { rows, current_epoch } = epochInfo;
      if (Array.isArray(rows)) {
        const list: EpochInfoItem[] = rows.map((e: any) => e as EpochInfoItem);
        list.sort((a, b) => b.end_time - a.end_time);
        const curEpochIndex = list?.findIndex(
          (item: any) => item.epoch_id === current_epoch
        );

        const epochOne = list.find((item) => item.epoch_id === 1);

        if (epochOne && epochOne?.start_time > Date.now()) {
          // not start
          setCurEpochInfo(epochOne);
        } else {
          setCurEpochInfo(
            curEpochIndex !== -1 ? list?.[curEpochIndex] : undefined
          );
        }

        setData(list);
      }
    }
  }, [epochInfo]);

  const isUnstart = useMemo(() => {
    // if (curEpochInfo) {
    //   return curEpochInfo?.start_time > Date.now();
    // }
    // return true;

    const epochOne = data?.find((item) => item.epoch_id === 1);
    if (epochOne) {
      return epochOne.start_time > Date.now();
    }
    return true;
  }, [data]);

  return { data, curEpochInfo, isUnstart, refresh };
};
