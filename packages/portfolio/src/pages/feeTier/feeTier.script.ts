/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useAccountInfo,
  usePrivateQuery,
} from "@orderly.network/hooks";
import { useDataTap } from "@orderly.network/react-app";
import { AccountStatusEnum, API } from "@orderly.network/types";
import type { Column } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { useFeeTierColumns } from "./column";
import { dataSource as defaultDataSource } from "./dataSource";

export type useFeeTierScriptReturn = ReturnType<typeof useFeeTierScript>;

export type UseFeeTierScriptOptions = {
  dataAdapter?: (
    columns: Column[],
    dataSource: any[],
  ) => { columns: Column[]; dataSource: any[] };
  onRow?: (
    record: any,
    index: number,
  ) => {
    normal: any;
    active: any;
  };
};

export const useFeeTierScript = (options?: UseFeeTierScriptOptions) => {
  const { dataAdapter } = options || {};
  const [tier, setTier] = useState<number>();
  const { data } = useAccountInfo();
  const { state } = useAccount();

  const cols = useFeeTierColumns();

  const { data: volumeStatistics } = usePrivateQuery<
    { perp_volume_last_30_days: number } | undefined
  >("/v1/volume/user/stats");

  const { columns, dataSource } = useMemo(() => {
    return typeof dataAdapter === "function"
      ? dataAdapter(cols, defaultDataSource)
      : { columns: cols, dataSource: defaultDataSource };
  }, [dataAdapter, cols]);

  const getFuturesCurrentTier = (
    feeList: typeof defaultDataSource,
    data: API.AccountInfo,
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
    if (typeof value === "undefined") {
      return undefined;
    }
    return `${new Decimal(value).mul(0.01).toString()}%`;
  }, [data]);

  const futures_maker_fee_rate = useMemo(() => {
    const value = data?.futures_maker_fee_rate;
    if (typeof value === "undefined") {
      return undefined;
    }
    return `${new Decimal(value).mul(0.01).toString()}%`;
  }, [data]);

  const authData = useDataTap(
    {
      tier,
      vol: volumeStatistics?.perp_volume_last_30_days,
      takerFeeRate: futures_taker_fee_rate,
      makerFeeRate: futures_maker_fee_rate,
    },
    {
      accountStatus:
        state.status === AccountStatusEnum.EnableTradingWithoutConnected
          ? AccountStatusEnum.EnableTradingWithoutConnected
          : AccountStatusEnum.EnableTrading,
    },
  );

  return {
    ...authData,
    columns,
    dataSource: dataSource,
    onRow: options?.onRow,
  };
};
