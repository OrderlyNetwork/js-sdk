import {
  useFundingFeeHistory,
  useQuery,
  useSymbolsInfo,
} from "@orderly.network/hooks";
import { usePagination } from "@orderly.network/ui";
import { subtractDaysFromCurrentDate } from "@orderly.network/utils";
import { useState } from "react";

// type FundingSearchParams = {
//   dataRange?: Date[];
// };

export const useFundingHistoryHook = () => {
  const [dateRange, setDateRange] = useState<Date[]>([
    subtractDaysFromCurrentDate(90),
    new Date(),
  ]);
  const [symbol, setSymbol] = useState<string>("All");
  const { page, pageSize, setPage, setPageSize, parseMeta } = usePagination();

  const [data, { isLoading, meta }] = useFundingFeeHistory({
    dataRange: dateRange.map((date) => date.getTime()),
    symbol,
    page,
    pageSize,
  });

  const onFilter = (filter: { name: string; value: any }) => {
    if (filter.name === "symbol") {
      setSymbol(filter.value);
    }

    if (filter.name === "dateRange") {
      setDateRange([filter.value.from, filter.value.to]);
    }
  };

  return {
    dataSource: data,
    meta: parseMeta(meta),
    isLoading,
    // onDateRangeChange,
    queryParameter: {
      symbol,
      dateRange,
    },
    onFilter,
    setPage,
    setPageSize,
  } as const;
};

export type UseFundingHistoryReturn = ReturnType<typeof useFundingHistoryHook>;
