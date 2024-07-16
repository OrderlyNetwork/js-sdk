import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MarketsType,
  useFundingRates,
  useMarkets,
  useMarketsStream,
  useSymbolsInfo,
} from "@orderly.network/hooks";
import { SortOrder, usePagination } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { MarketListWidgetProps } from "./widget";
import { TFavorite } from "../favorites/favorites.script";

export type UseMarketListScriptOptions = MarketListWidgetProps;
export type UseMarketListReturn = ReturnType<typeof useMarketListScript>;

export function useSort(defaultSortKey?: string, defaultSortOrder?: SortOrder) {
  const [key, setKey] = useState<string>();
  const [order, setOrder] = useState<SortOrder>();

  const onSort = useCallback((sortKey: string, sort: SortOrder) => {
    setKey(sortKey);
    setOrder(sort);
  }, []);

  const sortKey = key || defaultSortKey;
  const sortOrder = order || defaultSortOrder;

  const getSortedList = useCallback(
    (list: any[]) => {
      const sortedList = [...list];
      if (sortKey && sortOrder) {
        // sort list
        sortedList.sort((a: any, b: any) => {
          const val1 = a[sortKey];
          const val2 = b[sortKey];

          if (val1 === 0) return 1;
          if (val2 === 0) return -1;

          if (sortOrder === "desc") {
            return val2 - val1;
          }

          return val1 - val2;
        });
      }
      return sortedList;
    },
    [sortKey, sortOrder]
  );

  return { onSort, getSortedList, sortKey, sortOrder };
}

export const useMarketListScript = (options: UseMarketListScriptOptions) => {
  const { page, pageSize, setPage, setPageSize, parseMeta } = usePagination();

  const [data, favorite] = useMarkets(MarketsType.ALL);

  const { onSort, getSortedList } = useSort(
    options?.sortKey,
    options?.sortOrder
  );

  const pageData = useMemo(() => {
    const list = getSortedList(data);
    return getPageData(list, pageSize, page);
  }, [data, pageSize, page, getSortedList]);

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
    favorite: favorite as TFavorite,
    onSort,
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
    const list = futures?.map((item) => {
      const info = symbolsInfo[item.symbol];
      const rate = fundingRates[item.symbol];
      const est_funding_rate = rate("est_funding_rate", 0);
      const funding_period = info("funding_period");

      return {
        ...item,
        "8h_funding": get8hFunding(est_funding_rate, funding_period),
        quote_dp: info("quote_dp"),
        created_time: info("created_time"),
      };
    });
    return list || [];
  }, [symbolsInfo, futures, fundingRates]);
}
