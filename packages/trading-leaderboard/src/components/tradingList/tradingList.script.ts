import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePrivateQuery } from "@orderly.network/hooks";
import { TableSort, usePagination, useScreen } from "@orderly.network/ui";
import { differenceInDays } from "date-fns";
import { getDateRange, formatDateRange } from "../../utils";
import { useDataTap } from "@orderly.network/react-app";
import { API } from "@orderly.network/types";
import { useEndReached } from "../../hooks/useEndReached";

export type TradingListScriptOptioins = {};

export type TradingData = {
  account_id: string;
  address: string;
  broker_fee: number;
  date: string;
  perp_maker_volume: number;
  perp_taker_volume: number;
  perp_volume: number;
  total_fee: number;
};

export type TradingResponse = {
  meta: API.RecordsMeta;
  rows: TradingData[];
};
export type TradingListScriptReturn = ReturnType<typeof useTradingListScript>;

export const FilterDays = [7, 14, 30, 90] as const;
export type TFilterDays = (typeof FilterDays)[number];
export type DateRange = {
  from?: Date;
  to?: Date;
};

export function useTradingListScript() {
  const [searchValue, setSearchValue] = useState("");
  const [initialSort] = useState<TableSort>({
    sortKey: "perp_volume",
    sort: "desc",
  });
  const [sort, setSort] = useState<TableSort | undefined>(initialSort);
  const [dataList, setDataList] = useState<TradingData[]>([]);

  const { isMobile } = useScreen();

  const { dateRange, filterDay, updateFilterDay, filterItems, onFilter } =
    useFilter();

  const { page, pageSize, setPage, parsePagination } = usePagination({
    pageSize: 50,
  });

  const getKey = () => {
    const searchParams = new URLSearchParams();

    searchParams.set("page", page.toString());
    searchParams.set("size", pageSize.toString());

    searchParams.set("aggregateBy", "ACCOUNT");

    if (sort) {
      const prefix = sort.sort === "asc" ? "ascending" : "descending";
      searchParams.set("sort", `${prefix}_${sort.sortKey}`);
    }

    if (searchValue) {
      searchParams.set("address", searchValue);
    }

    if (dateRange.from) {
      searchParams.set("start_date", formatDateRange(dateRange.from!));
    }

    if (dateRange.to) {
      searchParams.set("end_date", formatDateRange(dateRange.to!));
    }

    return `/v1/volume/broker/daily?${searchParams.toString()}`;
  };

  const { data, isLoading } = usePrivateQuery<TradingResponse>(getKey(), {
    formatter: (res) => res,
    revalidateOnFocus: false,
  });

  const dataSource = useMemo(() => {
    const list = data?.rows || [];
    const total = data?.meta.total || 0;
    if (sort?.sortKey === "perp_volume") {
    }
    return list?.map((item, index) => {
      let rank: string | number = index + 1;

      if (searchValue) {
        rank = "-";
      } else {
        if (sort?.sortKey === "perp_volume" && sort?.sort === "asc") {
          rank = total - (page - 1) * pageSize - index;
        } else if (sort?.sortKey === "perp_volume" && sort?.sort === "desc") {
          rank = (page - 1) * pageSize + index + 1;
        }
      }

      return {
        ...item,
        rank,
      };
    });
  }, [data, sort, page, pageSize, searchValue]);

  useEffect(() => {
    if (!isMobile) {
      return;
    }
    if (page === 1) {
      setDataList(dataSource);
    } else {
      setDataList((prev) => [...prev, ...dataSource]);
    }
  }, [dataSource, isMobile, page]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const pagination = useMemo(
    () => parsePagination(data?.meta),
    [parsePagination, data]
  );

  useEndReached(sentinelRef, () => {
    if (!isLoading && isMobile && page < (pagination?.pageTotal || 0)) {
      setPage(page + 1);
    }
  });

  const onSearchValueChange = (value: string) => {
    setSearchValue(value);
  };

  const clearSearchValue = useCallback(() => {
    setSearchValue("");
  }, []);

  const onSort = useCallback(
    (sort?: TableSort) => {
      setSort(sort || initialSort);
    },
    [initialSort]
  );

  useEffect(() => {
    if (searchValue) {
      setPage(1);
    }
  }, [searchValue]);

  const _data = useDataTap(dataSource);

  return {
    pagination,
    dateRange,
    filterDay,
    updateFilterDay,
    filterItems,
    onFilter,
    initialSort,
    onSort,
    dataSource: _data,
    isLoading,
    searchValue,
    onSearchValueChange,
    clearSearchValue,
    isMobile,
    sentinelRef,
    dataList,
  };
}

const useFilter = () => {
  /// default is 90d
  const [filterDay, setFilterDay] = useState<TFilterDays | null>(90);

  const [dateRange, setDateRange] = useState<DateRange>(getDateRange(90));

  const updateFilterDay = (day: TFilterDays) => {
    setFilterDay(day);
    setDateRange(getDateRange(day));
  };

  const onFilter = (filter: { name: string; value: any }) => {
    if (filter.name === "dateRange") {
      const newDateRange = filter.value;
      setDateRange(newDateRange);

      if (newDateRange.from && newDateRange.to) {
        const offsetDay =
          Math.abs(differenceInDays(newDateRange.from, newDateRange.to)) + 1;

        const dateRange = getDateRange(offsetDay);
        if (
          formatDateRange(dateRange.from) ===
            formatDateRange(newDateRange.from) &&
          formatDateRange(dateRange.to) === formatDateRange(newDateRange.to)
        ) {
          setFilterDay(offsetDay as any);
        } else {
          setFilterDay(null);
        }
      }
    }
  };

  const filterItems = useMemo(() => {
    const dateRangeFilter = {
      type: "range",
      name: "dateRange",
      value: dateRange,
      max: 90,
    };

    return [dateRangeFilter] as any;
  }, [dateRange]);

  return {
    filterItems,
    onFilter,
    dateRange,
    filterDay,
    updateFilterDay,
  };
};
