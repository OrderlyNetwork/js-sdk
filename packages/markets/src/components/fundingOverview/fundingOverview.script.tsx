import { useMemo } from "react";
import {
  useFundingRateHistory,
  useMarkets,
  MarketsType,
} from "@orderly.network/hooks";
import { usePagination } from "@orderly.network/ui";
import { useSort, searchBySymbol } from "../../utils";
import { useMarketsContext } from "../../components/marketsProvider";

export type PeriodKey = "1d" | "3d" | "7d" | "14d" | "30d" | "90d";

export type ProcessedFundingData = {
  symbol: string;
  estFunding: number;
  lastFunding: number;
  funding1d: number | string;
  funding3d: number | string;
  funding7d: number | string;
  funding14d: number | string;
  funding30d: number | string;
  funding90d: number | string;
  "1dPositive": number | string;
  "3dPositive": number | string;
  "7dPositive": number | string;
  "14dPositive": number | string;
  "30dPositive": number | string;
  "90dPositive": number | string;
};

export type UseFundingOverviewReturn = {
  dataSource: ProcessedFundingData[];
  isLoading: boolean;
  pagination: {
    pageSize: number;
    page: number;
  };
  onSort: any;
};

export const useFundingOverviewScript = () => {
  const { pageSize, pagination } = usePagination({ pageSize: 10 });
  const [marketData] = useMarkets(MarketsType.ALL);
  const {
    data: historyData,
    isLoading: isHistoryLoading,
    getPositiveRates,
  } = useFundingRateHistory();
  const { onSort, getSortedList } = useSort();
  const { searchValue } = useMarketsContext();

  const processedData = useMemo((): ProcessedFundingData[] => {
    if (!marketData?.length) return [];

    const periods: PeriodKey[] = ["1d", "3d", "7d", "14d", "30d", "90d"];
    const posRates = periods.reduce((acc, period) => {
      acc[period] = getPositiveRates(historyData, period);
      return acc;
    }, {} as Record<string, Record<string, number>>);

    return marketData.map((market) => {
      const history = historyData?.find((h) => h.symbol === market.symbol);

      return {
        symbol: market.symbol,
        estFunding: market.est_funding_rate,
        lastFunding: market.last_funding_rate,
        funding1d: history?.funding?.["1d"]?.rate ?? 0,
        funding3d: history?.funding?.["3d"]?.rate ?? 0,
        funding7d: history?.funding?.["7d"]?.rate ?? 0,
        funding14d: history?.funding?.["14d"]?.rate ?? 0,
        funding30d: history?.funding?.["30d"]?.rate ?? 0,
        funding90d: history?.funding?.["90d"]?.rate ?? 0,
        "1dPositive": posRates["1d"][market.symbol] ?? "-",
        "3dPositive": posRates["3d"][market.symbol] ?? "-",
        "7dPositive": posRates["7d"][market.symbol] ?? "-",
        "14dPositive": posRates["14d"][market.symbol] ?? "-",
        "30dPositive": posRates["30d"][market.symbol] ?? "-",
        "90dPositive": posRates["90d"][market.symbol] ?? "-",
      };
    });
  }, [marketData, historyData, getPositiveRates]);

  const filteredData = useMemo(() => {
    return searchBySymbol(processedData, searchValue);
  }, [processedData, searchValue, pagination]);

  const dataSource = useMemo(
    () => getSortedList(filteredData),
    [filteredData, getSortedList]
  );

  return { dataSource, isLoading: isHistoryLoading, pagination, onSort };
};
