import { useMemo, useState } from "react";
import { useAssetsHistory } from "@orderly.network/hooks";
import { usePagination } from "@orderly.network/ui";
import { subtractDaysFromCurrentDate } from "@orderly.network/utils";
import { parseDateRangeForFilter } from "../helper/date";
import { getDate, getMonth, getYear, set } from "date-fns";

const useAssetHistoryHook = () => {
  // const [fileter, setFilter] = useState<FilterParams>({});

  const [today] = useState(() => {
    const d = new Date();

    return new Date(getYear(d), getMonth(d), getDate(d), 0, 0, 0);
  });

  const [dateRange, setDateRange] = useState<Date[]>([
    subtractDaysFromCurrentDate(90, today),
    today,
  ]);
  const [side, setSide] = useState<string>("All");
  const { page, pageSize, setPage, parsePagination } = usePagination();

  const [data, { meta, isLoading }] = useAssetsHistory({
    startTime: dateRange[0].getTime().toString(),
    endTime: set(dateRange[1], {
      hours: 23,
      minutes: 59,
      seconds: 59,
      milliseconds: 0,
    })
      .getTime()
      .toString(),
    page,
    pageSize,
    side,
  });

  const onFilter = (filter: { name: string; value: any }) => {
    if (filter.name === "side") {
      setSide(filter.value);
      setPage(1);
    }

    if (filter.name === "dateRange") {
      // console.log("filter.value", filter.value);

      // setDateRange([filter.value.from, filter.value.to]);
      setDateRange(parseDateRangeForFilter(filter.value));
      setPage(1);
    }
  };

  const pagination = useMemo(
    () => parsePagination(meta),
    [parsePagination, meta]
  );

  return {
    dataSource: data,
    total: meta?.total,
    isLoading,
    // onDateRangeChange,
    queryParameter: {
      side,
      dateRange,
    },
    // onSearch,
    onFilter,
    pagination,
  };
};

export { useAssetHistoryHook };

export type UseAssetHistoryReturn = ReturnType<typeof useAssetHistoryHook>;
