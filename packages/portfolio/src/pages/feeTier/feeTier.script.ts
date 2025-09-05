/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
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

export interface FeeDataType {
  tier: number;
  volume_min?: number | null;
  volume_max?: number | null;
  volume_node?: React.ReactNode;
  or?: string | null;
  maker_fee: string;
  taker_fee: string;
}

const findCurrentTier = (feeList: FeeDataType[], data: API.AccountInfo) => {
  const { futures_taker_fee_rate = 0, futures_maker_fee_rate = 0 } = data;
  const takerRate = new Decimal(futures_taker_fee_rate).mul(0.01);
  const makerRate = new Decimal(futures_maker_fee_rate).mul(0.01);
  const findItem = feeList.find(
    (item) =>
      item.taker_fee === `${takerRate.toNumber()}%` &&
      item.maker_fee === `${makerRate.toNumber()}%`,
  );
  return findItem?.tier;
};

export const useFeeTierScript = (options?: UseFeeTierScriptOptions) => {
  const { dataAdapter } = options || {};
  const [tier, setTier] = useState<number>();
  const { data, isLoading } = useAccountInfo();
  const { state } = useAccount();

  const cols = useFeeTierColumns();

  const { data: volumeStatistics } = usePrivateQuery<{
    perp_volume_last_30_days: number;
  }>("/v1/volume/user/stats");

  const { columns, dataSource } = useMemo(() => {
    return typeof dataAdapter === "function"
      ? dataAdapter(cols, defaultDataSource)
      : { columns: cols, dataSource: defaultDataSource };
  }, [dataAdapter, cols]);

  useEffect(() => {
    if (!data || isLoading) {
      return;
    }
    setTier(findCurrentTier(dataSource, data));
  }, [data, isLoading, dataSource]);

  const authData = useDataTap(
    {
      tier: tier,
      vol: volumeStatistics?.perp_volume_last_30_days,
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
    columns: columns,
    dataSource: dataSource,
    onRow: options?.onRow,
  };
};
