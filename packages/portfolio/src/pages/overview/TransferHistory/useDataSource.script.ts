import React from "react";
import { getDate, getMonth, getYear, set } from "date-fns";
import { useAccount, useTransferHistory } from "@orderly.network/hooks";
import { usePagination } from "@orderly.network/ui";
import type { PaginationMeta } from "@orderly.network/ui";
import { subtractDaysFromCurrentDate } from "@orderly.network/utils";
import { parseDateRangeForFilter } from "../helper/date";
import { AccountType } from "./transfer.ui";

export const useTransferHistoryHook = () => {
  // const today = useRef(setMinutes(setHours(new Date(), 23), 59));

  const today = React.useMemo<Date>(() => {
    const date = new Date();
    return new Date(getYear(date), getMonth(date), getDate(date), 0, 0, 0);
  }, []);

  const [dateRange, setDateRange] = React.useState<Date[]>([
    subtractDaysFromCurrentDate(90, today),
    today,
  ]);

  const { page, pageSize, setPage, parsePagination } = usePagination();

  const [accountValue, setValue] = React.useState<string>(AccountType.ALL);

  const [side, setSide] = React.useState<"IN" | "OUT">("OUT");

  const [data, { isLoading, meta }] = useTransferHistory({
    dataRange: [
      dateRange[0]?.getTime(),
      set(dateRange[1], {
        hours: 23,
        minutes: 59,
        seconds: 59,
        milliseconds: 0,
      })?.getTime(),
    ],
    side: side,
    size: pageSize,
    page: page,
  });

  const { state } = useAccount();

  const filteredData = React.useMemo(() => {
    if (!accountValue || accountValue === AccountType.ALL) {
      return data;
    }
    return data.filter((item) => {
      if (accountValue === AccountType.MAIN) {
        return item.from_account_id === state.mainAccountId;
      } else {
        return item.from_account_id === accountValue;
      }
    });
  }, [data, accountValue]);

  const onAccountFilter = React.useCallback(
    (filter: { value: string; name: string }) => {
      if (filter.name === "account") {
        setValue(filter.value);
      }
      if (filter.name === "side") {
        setSide(filter.value as "IN" | "OUT");
      }
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
    dataSource: filteredData,
    isLoading,
    // onDateRangeChange,
    queryParameter: {
      side,
      dateRange,
    },
    accountValue,
    onFilter: onAccountFilter,
    pagination,
  } as const;
};

export type useTransferHistoryHookReturn = ReturnType<
  typeof useTransferHistoryHook
>;
