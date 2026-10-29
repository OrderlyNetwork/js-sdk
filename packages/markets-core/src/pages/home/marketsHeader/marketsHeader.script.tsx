import { useMemo } from "react";
import { useMarkets, useQuery, MarketsType } from "@orderly.network/hooks";
import { Decimal } from "@orderly.network/utils";
import { useLowVolumeMarketFilter } from "../../../components/shared/lowVolumeMarketFilter";
import { filterMarketsByLowVolume } from "../../../components/shared/marketVolumeFilter";
import { sortList } from "../../../utils";

export type MarketsHeaderReturns = ReturnType<typeof useMarketsHeaderScript>;

type MarketsHeaderFilterState = {
  newsHiddenByLowVolumeFilter?: boolean;
  gainersHiddenByLowVolumeFilter?: boolean;
  losersHiddenByLowVolumeFilter?: boolean;
};

export const useMarketsHeaderScript = () => {
  const data = useDataSource();

  return {
    ...data,
  };
};

export function useDataSource() {
  const [markets, favorite] = useMarkets(MarketsType.ALL);
  const { showLowVolume } = useLowVolumeMarketFilter();
  const { data: balance } = useQuery("/v1/public/balance/stats");

  const filteredMarkets = useMemo(
    () => filterMarketsByLowVolume(markets, showLowVolume),
    [markets, showLowVolume],
  );

  const news = useMemo(
    () =>
      sortList(filteredMarkets.visibleMarkets, {
        sortKey: "created_time",
        sortOrder: "desc",
      }).slice(0, 5),
    [filteredMarkets],
  );

  const gainers = useMemo(
    () =>
      sortList(filteredMarkets.visibleMarkets, {
        sortKey: "change",
        sortOrder: "desc",
      }).slice(0, 5),
    [filteredMarkets],
  );

  const losers = useMemo(
    () =>
      sortList(filteredMarkets.visibleMarkets, {
        sortKey: "change",
        sortOrder: "asc",
      }).slice(0, 5),
    [filteredMarkets],
  );

  const total24Amount = useMemo(
    () =>
      markets?.reduce((prevValue: Decimal, curValue: any) => {
        return prevValue.add(curValue["24h_amount"] || 0);
      }, new Decimal(0)) || new Decimal(0),
    [markets],
  );

  const totalOpenInterest = useMemo(
    () =>
      markets?.reduce((prevValue: Decimal, curValue: any) => {
        return prevValue.add(curValue["openInterest"] || 0);
      }, new Decimal(0)) || new Decimal(0),
    [markets],
  );

  const tvl = useMemo(() => {
    if (!balance) return 0;

    const { total_holding = 0 } = balance as any;
    return new Decimal(total_holding).toNumber();
  }, [balance]);

  const filterState: MarketsHeaderFilterState = {
    newsHiddenByLowVolumeFilter: filteredMarkets.allHidden,
    gainersHiddenByLowVolumeFilter: filteredMarkets.allHidden,
    losersHiddenByLowVolumeFilter: filteredMarkets.allHidden,
  };

  return {
    ...filterState,
    markets,
    news,
    gainers,
    losers,
    total24Amount: total24Amount.toNumber(),
    totalOpenInterest: totalOpenInterest.toNumber(),
    tvl,
    favorite,
  };
}
