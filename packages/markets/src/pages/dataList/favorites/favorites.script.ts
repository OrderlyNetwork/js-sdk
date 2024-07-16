import { useEffect, useMemo, useState } from "react";
import {
  MarketsType,
  useFundingRates,
  useMarkets,
  useMarketsStream,
  useSymbolsInfo,
} from "@orderly.network/hooks";
import { usePagination } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { FavoriteTab } from "@orderly.network/hooks";

export type UseFavoritesReturn = ReturnType<typeof useFavoritesScript>;

export type MarketsFavorite = ReturnType<typeof useMarkets>[1];

export type TFavorite = MarketsFavorite & {
  curTab: FavoriteTab;
  setCurTab: (tab: FavoriteTab) => void;
};

export const useFavoritesScript = () => {
  const { page, pageSize, setPage, setPageSize, parseMeta } = usePagination();
  const [data, favorite] = useMarkets(MarketsType.FAVORITES);

  const { favorites, favoriteTabs, getLastSelFavTab } = favorite || {};

  const [curTab, setCurTab] = useState(getLastSelFavTab() || favoriteTabs[0]);

  const filterData = useMemo(() => {
    return favorites
      ?.filter(
        (item) => item.tabs?.findIndex((tab) => tab.id === curTab.id) !== -1
      )
      ?.map((fav) => {
        const index = data?.findIndex((item) => item.symbol === fav.name);
        if (index !== -1) {
          return data[index];
        }
        return null;
      })
      ?.filter((item) => item);
  }, [data, curTab, favorites]);

  const pageData = useMemo(() => {
    const list = [...filterData];
    return getPageData(list, pageSize, page);
  }, [filterData, pageSize, page]);

  const meta = useMemo(
    () =>
      parseMeta({
        total: data?.length,
        current_page: page,
        records_per_page: pageSize,
      }),
    [data, page, pageSize]
  );

  useEffect(() => {
    // 切换页面大小时，重置页码
    setPage(1);
  }, [pageSize]);

  return {
    dataSource: pageData,
    meta,
    setPage,
    setPageSize,
    favorite: {
      ...favorite,
      curTab,
      setCurTab,
    } as TFavorite,
  };
};

export function getPageData(list: any[], pageSize: number, pageIndex: number) {
  const pageData = [];
  let rows = [];
  for (let i = 0; i < list.length; i++) {
    rows.push(list[i]);
    if ((i + 1) % pageSize === 0 || i === list.length - 1) {
      pageData.push(rows);
      rows = [];
    }
  }
  return pageData[pageIndex - 1] || [];
}

function get8hFunding(est_funding_rate: number, funding_period: number) {
  let funding8h = 0;

  if (funding_period) {
    funding8h = new Decimal(est_funding_rate)
      .mul(funding_period)
      .div(8)
      .toNumber();
  }

  return funding8h;
}

export function useDataSource() {
  const symbolsInfo = useSymbolsInfo();
  const fundingRates = useFundingRates();
  const { data: futures } = useMarketsStream();

  return useMemo(() => {
    const list = futures?.map((item: any) => {
      const { open_interest = 0, index_price = 0 } = item;

      const info = symbolsInfo[item.symbol];
      const rate = fundingRates[item.symbol];
      const est_funding_rate = rate("est_funding_rate", 0);
      const funding_period = info("funding_period");

      return {
        ...item,
        "8h_funding": get8hFunding(est_funding_rate, funding_period),
        quote_dp: info("quote_dp"),
        created_time: info("created_time"),
        openInterest: new Decimal(open_interest).mul(index_price).toNumber(),
      };
    });
    return list || [];
  }, [symbolsInfo, futures, fundingRates]);
}
