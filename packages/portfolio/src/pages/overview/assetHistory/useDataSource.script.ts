import { useState } from "react";
import {
  AssetHistoryStatusEnum,
  useAssetsHistory,
} from "@orderly.network/hooks";
import { usePagination } from "@orderly.network/ui";
import { subtractDaysFromCurrentDate } from "@orderly.network/utils";

const useAssetHistoryHook = () => {
  // const [fileter, setFilter] = useState<FilterParams>({});
  const [dateRange, setDateRange] = useState<Date[]>([
    subtractDaysFromCurrentDate(90),
    new Date(),
  ]);
  const [side, setSide] = useState<string>("All");
  const { page, pageSize, setPage, setPageSize, parseMeta } = usePagination();

  const [data, { meta }] = useAssetsHistory({
    startTime: dateRange[0].getTime().toString(),
    endTime: dateRange[1].getTime().toString(),
    page,
    pageSize,
    side,
  });

  // const onSearch = (filter: FilterParams) => {
  //   setFilter((prevState) => ({
  //     ...prevState,
  //     ...filter,
  //   }));
  // };

  const onFilter = (filter: { name: string; value: any }) => {
    if (filter.name === "side") {
      setSide(filter.value);
    }

    if (filter.name === "dateRange") {
      setDateRange([filter.value.from, filter.value.to]);
    }
  };

  return {
    dataSource: data,
    // page: meta?.currentPage,
    meta: parseMeta(meta),
    total: meta?.total,
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
