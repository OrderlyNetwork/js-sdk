import React from "react";
import { getDate, getMonth, getYear, set } from "date-fns";
import { useVaultsHistory } from "@orderly.network/hooks";
import { usePagination } from "@orderly.network/ui";
import type { PaginationMeta } from "@orderly.network/ui";
import { subtractDaysFromCurrentDate } from "@orderly.network/utils";
import { parseDateRangeForFilter } from "../helper/date";

export const useVaultsHistoryHook = () => {
  const today = React.useMemo<Date>(() => {
    const date = new Date();
    return new Date(getYear(date), getMonth(date), getDate(date), 0, 0, 0);
  }, []);

  const [dateRange, setDateRange] = React.useState<Date[]>([
    subtractDaysFromCurrentDate(90, today),
    today,
  ]);

  const { page, pageSize, setPage, parsePagination } = usePagination();

  const [data, { isLoading, meta }] = useVaultsHistory({
    dataRange: [
      dateRange[0]?.getTime(),
      set(dateRange[1], {
        hours: 23,
        minutes: 59,
        seconds: 59,
        milliseconds: 0,
      })?.getTime(),
    ],
    size: pageSize,
    page: page,
  });

  const onDateRangeFilter = React.useCallback(
    (filter: { value: string; name: string }) => {
      if (filter.name === "dateRange") {
        setDateRange(parseDateRangeForFilter(filter.value as any));
      }
      setPage(1);
    },
    [setPage],
  );

  const pagination = React.useMemo<PaginationMeta>(
    () => parsePagination(meta),
    [parsePagination, meta],
  );

  return {
    dataSource: data,
    isLoading,
    dateRange,
    onFilter: onDateRangeFilter,
    pagination,
  } as const;
};

export type useVaultsHistoryHookReturn = ReturnType<
  typeof useVaultsHistoryHook
>;
