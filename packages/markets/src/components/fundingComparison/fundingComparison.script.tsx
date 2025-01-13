import { useFundingRates, useQuery } from "@orderly.network/hooks";
import { useMemo } from "react";
import { usePagination } from "@orderly.network/ui";
import { useSort, searchBySymbol } from "../../utils";
import { useMarketsContext } from "../../components/marketsProvider";

export const exchanges = [
  "WOOFi Pro",
  "Binance",
  "OKX",
  "Bybit",
  "dYdX",
  "Bitget",
  "Kucoin",
];

export const useFundingComparisonScript = () => {
  const { pageSize, setPage, pagination } = usePagination({
    pageSize: 10,
  });
  const { onSort, getSortedList } = useSort();
  const { searchValue } = useMarketsContext();

  const fundingRates = useFundingRates();

  const { data, isLoading } = useQuery<
    Array<{
      symbol: string;
      exchanges: Array<{
        name: string;
        last: number;
      }>;
    }>
  >("/v1/public/market_info/funding_comparison");

  const processedData = useMemo(() => {
    if (!data?.length) return [];
    return data.map((row: any) => {
      const exchangeData: any = {
        symbol: row.symbol,
      };

      exchanges.forEach((name, index) => {
        const normalizedName = name.toLowerCase();

        if (normalizedName === "woofi pro") {
          const rate = fundingRates[row.symbol];
          exchangeData[`exchange_${index}`] = rate("last_funding_rate") ?? null;
          return;
        }

        const exchange = row.exchanges.find(
          (e: any) => e.name.toLowerCase() === normalizedName
        );
        exchangeData[`exchange_${index}`] = exchange?.last ?? null;
      });

      return exchangeData;
    });
  }, [data, exchanges, fundingRates]);

  const filteredData = useMemo(() => {
    return searchBySymbol(processedData, searchValue);
  }, [processedData, searchValue, pagination]);

  const dataSource = useMemo(
    () => getSortedList(filteredData),
    [filteredData, getSortedList]
  );

  return {
    data: dataSource,
    isLoading,
    pagination,
    onSort,
  };
};
