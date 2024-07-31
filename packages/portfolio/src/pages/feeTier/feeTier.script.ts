import { useEffect, useMemo, useState } from "react";
import { useAccountInfo, usePrivateQuery } from "@orderly.network/hooks";
import { Decimal } from "@orderly.network/utils";
import { dataSource } from "./dataSource";
import { API } from "@orderly.network/types";

export type useFeeTierScriptReturn = ReturnType<typeof useFeeTierScript>;

export function useFeeTierScript() {
  const [tier, setTier] = useState<number>();
  const { data } = useAccountInfo();
  const { data: volumeStatistics } = usePrivateQuery<
    | {
        perp_volume_last_30_days: number;
      }
    | undefined
  >("/v1/volume/user/stats");

  const getFuturesCurrentTier = (
    feeList: typeof dataSource,
    data: API.AccountInfo
  ) => {
    const { futures_taker_fee_rate = 0, futures_maker_fee_rate = 0 } = data;
    const takerRate = `${new Decimal(futures_taker_fee_rate)
      .mul(0.01)
      .toString()}%`;
    const makerRate = `${new Decimal(futures_maker_fee_rate)
      .mul(0.01)
      .toString()}%`;

    for (const item of feeList) {
      if (takerRate === item.taker_fee && makerRate === item.maker_fee) {
        return item.tier;
      }
    }
  };

  useEffect(() => {
    if (!data) {
      return;
    }

    const tier = getFuturesCurrentTier(dataSource, data);
    setTier(tier!);
  }, [data]);

  const futures_taker_fee_rate = useMemo(() => {
    const value = data?.futures_taker_fee_rate;
    if (typeof value === "undefined") return undefined;
    return `${new Decimal(value).mul(0.01).toString()}%`;
  }, [data]);

  const futures_maker_fee_rate = useMemo(() => {
    const value = data?.futures_maker_fee_rate;
    if (typeof value === "undefined") return undefined;
    return `${new Decimal(value).mul(0.01).toString()}%`;
  }, [data]);

  return {
    tier,
    vol: volumeStatistics?.perp_volume_last_30_days,
    futures_taker_fee_rate,
    futures_maker_fee_rate,
  };
}
