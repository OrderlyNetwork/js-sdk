import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useAccountInfo,
  usePrivateQuery,
} from "@orderly.network/hooks";
import { Decimal } from "@orderly.network/utils";
import { dataSource as defaultDataSource } from "./dataSource";
import { AccountStatusEnum, API } from "@orderly.network/types";
import { useDataTap } from "@orderly.network/react-app";
import { Column } from "@orderly.network/ui";
import { useFeeTierColumns } from "./column";

export type useFeeTierScriptReturn = ReturnType<typeof useFeeTierScript>;

export type UseFeeTierScriptOptions = {
  dataAdapter?: (
    columns: Column[],
    dataSource: any[]
  ) => { columns: Column[]; dataSource: any[] };
};

export function useFeeTierScript(options?: UseFeeTierScriptOptions) {
  const { dataAdapter } = options || {};
  const [tier, setTier] = useState<number>();
  const { state } = useAccount();
  const { data } = useAccountInfo();

  const cols = useFeeTierColumns();

  const { data: volumeStatistics } = usePrivateQuery<
    | {
        perp_volume_last_30_days: number;
      }
    | undefined
  >("/v1/volume/user/stats");

  const { columns, dataSource } = useMemo(() => {
    return typeof dataAdapter === "function"
      ? dataAdapter(cols, defaultDataSource)
      : {
          columns: cols,
          dataSource: defaultDataSource,
        };
  }, [dataAdapter, cols]);

  const getFuturesCurrentTier = (
    feeList: typeof defaultDataSource,
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
  }, [data, dataSource]);

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

  const tierValue = useDataTap(tier, {
    accountStatus: AccountStatusEnum.EnableTrading,
  });
  const volValue = useDataTap(volumeStatistics?.perp_volume_last_30_days);
  const futures_taker_fee_rateValue = useDataTap(futures_taker_fee_rate);
  const futures_maker_fee_rateValue = useDataTap(futures_maker_fee_rate);

  return {
    tier: tierValue,
    vol: volValue,
    takerFeeRate: futures_taker_fee_rateValue,
    makerFeeRate: futures_maker_fee_rateValue,
    columns,
    dataSource,
  };
}
