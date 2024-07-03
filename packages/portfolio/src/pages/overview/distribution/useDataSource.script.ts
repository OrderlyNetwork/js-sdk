import { useDistributionHistory } from "@orderly.network/hooks";
import { subtractDaysFromCurrentDate } from "@orderly.network/utils";
import { useState } from "react";
import { usePagination } from "@orderly.network/ui";

export const useDistributionHistoryHook = () => {
  const [dateRange, setDateRange] = useState<Date[]>([
    subtractDaysFromCurrentDate(90),
    new Date(),
  ]);
  const [type, setType] = useState<string>("All");
  const { page, pageSize, setPage, setPageSize, parseMeta } = usePagination();

  const [data, { isLoading, meta }] = useDistributionHistory({
    dataRange: dateRange.map((date) => date.getTime()),
    pageSize,
    page,
  });

  // const res = useQuery("v1/public/info/funding_period");

  const onFilter = (filter: { name: string; value: any }) => {
    if (filter.name === "type") {
      setType(filter.value);
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
      type,
      dateRange,
    },
    onFilter,
    setPage,
    setPageSize,
  } as const;
};

export type useDistributionHistoryHookReturn = ReturnType<
  typeof useDistributionHistoryHook
>;
