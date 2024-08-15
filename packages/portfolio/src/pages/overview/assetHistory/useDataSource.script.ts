import { useRef, useState } from "react";
import { useAssetsHistory } from "@orderly.network/hooks";
import { usePagination } from "@orderly.network/ui";
import { subtractDaysFromCurrentDate } from "@orderly.network/utils";
import { parseDateRangeForFilter } from "../helper/date";
import { getDate, getMonth, getYear, setHours, setMinutes } from "date-fns";

const useAssetHistoryHook = () => {
  // const [fileter, setFilter] = useState<FilterParams>({});

  const [today] = useState(() => {
    const d = new Date();

    return new Date(getYear(d), getMonth(d), getDate(d), 23, 59, 0);
  });

  const [dateRange, setDateRange] = useState<Date[]>([
    subtractDaysFromCurrentDate(90, today),
    today,
  ]);
  const [side, setSide] = useState<string>("All");
  const { page, pageSize, setPage, setPageSize, parseMeta } = usePagination();

  const [data, { meta, isLoading }] = useAssetsHistory({
    startTime: dateRange[0].getTime().toString(),
    endTime: dateRange[1].getTime().toString(),
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

  return {
    dataSource: data,
    // page: meta?.currentPage,
    meta: parseMeta(meta),
    total: meta?.total,
    isLoading,
    // onDateRangeChange,
    queryParameter: {
      side,
      dateRange,
    },
    // pageSize: meta.,
    // onSearch,
    onFilter,
    setPage,
    setPageSize,
  };
};

export { useAssetHistoryHook };

export type UseAssetHistoryReturn = ReturnType<typeof useAssetHistoryHook>;
