import { useEffect, useState } from "react";
import { useAccountInfo, usePrivateDataObserver, usePrivateQuery } from "@orderly.network/hooks";
import { Decimal } from "@orderly.network/utils";
import { dataSource } from "./dataSource";

export type useFeeTierScriptReturn = ReturnType<typeof useFeeTierScript>;

export function useFeeTierScript() {
  const [tier, setTier] = useState<number>();
  const { data } = useAccountInfo();
  const { data: volumeStatistics } = usePrivateQuery<{
    perp_volume_last_30_days: number
  } | undefined>('/v1/volume/user/stats');
  
  console.log("volumeStatistics", volumeStatistics);
  

  const getFuturesCurrentTier = (
    feeList: typeof dataSource,
    takerFeeRate: number
  ) => {
    const feeRate = `${new Decimal(takerFeeRate).mul(0.01).toString()}%`;

    for (const item of feeList) {
      if (feeRate === item.taker_fee) {
        return item.tier;
      }
    }
  };

  useEffect(() => {
    if (!data) {
      return;
    }

    const takerFeeRate = data?.futures_taker_fee_rate;
    const tier = getFuturesCurrentTier(dataSource, takerFeeRate);
    setTier(tier!);
  }, [data]);

  return { tier, vol: volumeStatistics?.perp_volume_last_30_days };
}
