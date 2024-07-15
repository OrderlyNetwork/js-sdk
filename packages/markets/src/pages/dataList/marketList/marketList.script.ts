import { useEffect, useMemo } from "react";
import {
  useFundingRates,
  useMarketsStream,
  useSymbolsInfo,
} from "@orderly.network/hooks";
import { usePagination } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { MarketListWidgetProps } from "./widget";

export type UseMarketListScriptOptions = MarketListWidgetProps;
export type UseMarketListReturn = ReturnType<typeof useMarketListScript>;

export const useMarketListScript = (options: UseMarketListScriptOptions) => {
  const { type = "all" } = options || {};
  const { page, pageSize, setPage, setPageSize, parseMeta } = usePagination();

  const dataSource = useDataSource();

  const pageData = useMemo(() => {
    const list = [...dataSource];
    if (type === "all") {
      // 24h_amount 倒序，0 排最后面
      list.sort((a: any, b: any) => {
        const a_vol = a["24h_amount"];
        const b_vol = b["24h_amount"];

        if (a_vol === 0) return 1;
        if (b_vol === 0) return -1;
        return b_vol - a_vol;
      });
    } else {
      list.sort((a, b) => b.created_time - a.created_time);
    }

    return getPageData(list, pageSize, page);
  }, [dataSource, pageSize, page, type]);

  const meta = useMemo(
    () =>
      parseMeta({
        total: dataSource?.length,
        current_page: page,
        records_per_page: pageSize,
      }),
    [dataSource, page, pageSize]
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
