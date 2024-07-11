import { useEffect, useMemo } from "react";
import {
  MarketListType,
  useFundingRates,
  useMarketsList,
  useMarketsStream,
  useSymbolsInfo,
} from "@orderly.network/hooks";
import { usePagination } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";

export type UseFavoritesReturn = ReturnType<typeof useFavoritesScript>;

export const useFavoritesScript = () => {
  const { page, pageSize, setPage, setPageSize, parseMeta } = usePagination();
  const [data] = useMarketsList(MarketListType.FAVORITES);

  console.log("useMarketsList", data);

  const dataSource = useDataSource();

  const pageData = useMemo(() => {
    const list = [...data];
    return getPageData(list, pageSize, page);
  }, [dataSource, pageSize, page]);

  const meta = useMemo(
    () =>
      parseMeta({
        total: dataSource?.length,
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
  // const { data: volumeData } = useQuery("/v1/public/volume/stats");
  const symbolsInfo = useSymbolsInfo();
  const fundingRates = useFundingRates();
  const { data: futures } = useMarketsStream();
  console.log("futures", futures);

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
