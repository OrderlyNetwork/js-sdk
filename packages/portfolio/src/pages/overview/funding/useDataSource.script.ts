import {
  useFundingFeeHistory,
  useQuery,
  useSymbolsInfo,
} from "@orderly.network/hooks";
import { usePagination } from "@orderly.network/ui";
import { subtractDaysFromCurrentDate } from "@orderly.network/utils";
import { useRef, useState } from "react";
import { useDataTap } from "@orderly.network/react-app";
import { parseDateRangeForFilter } from "../helper/date";
import { getDate, getMonth, getYear, setHours, setMinutes } from "date-fns";

// type FundingSearchParams = {
//   dataRange?: Date[];
// };

export const useFundingHistoryHook = () => {
  // const today = useRef(setMinutes(setHours(new Date(), 23), 59));

  const [today] = useState(() => {
    const d = new Date();

    return new Date(getYear(d), getMonth(d), getDate(d), 23, 59, 0);
  });

  const [dateRange, setDateRange] = useState<Date[]>([
    subtractDaysFromCurrentDate(90, today),
    today,
  ]);

  const [symbol, setSymbol] = useState<string>("All");
  const { page, pageSize, setPage, setPageSize, parseMeta } = usePagination();

  const [data, { isLoading, meta }] = useFundingFeeHistory(
    {
      dataRange: dateRange.map((date) => date.getTime()),
      symbol,
      page,
      pageSize,
    },
    {
      keepPreviousData: true,
    }
  );

  const onFilter = (filter: { name: string; value: any }) => {
    if (filter.name === "symbol") {
      setSymbol(filter.value);
      setPage(1);
    }

    if (filter.name === "dateRange") {
      // setDateRange([filter.value.from, filter.value.to]);
      setDateRange(parseDateRangeForFilter(filter.value));
      setPage(1);
    }
  };

  // const filteredData = useDataTap(data);

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
