import { useEffect, useState } from "react";
import { useAccountInfo } from "@orderly.network/hooks";
import { Decimal } from "@orderly.network/utils";
import { dataSource } from "./dataSource";

export type useFeeTierScriptReturn = ReturnType<typeof useFeeTierScript>;

export function useFeeTierScript() {
  const [tier, setTier] = useState<number>();
  const { data } = useAccountInfo();

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

  return { tier };
}
