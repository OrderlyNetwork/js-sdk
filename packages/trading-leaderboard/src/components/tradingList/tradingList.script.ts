import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAccount, usePrivateQuery } from "@orderly.network/hooks";
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
  // custom field
  key?: string;
};

export type TradingResponse = {
  meta: API.RecordsMeta;
  rows: TradingData[];
};
export type TradingListScriptReturn = ReturnType<typeof useTradingListScript>;

export const FilterDays = [7, 14, 30, 90] as const;
export type TFilterDays = typeof FilterDays[number];
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

  const { state } = useAccount();

  const { isMobile } = useScreen();

  const { dateRange, filterDay, updateFilterDay, filterItems, onFilter } =
    useFilter();

  const { page, pageSize, setPage, parsePagination } = usePagination({
    pageSize: 100,
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

  const getTop100Key = () => {
    if (!state.address) {
      return "";
    }
    const dateRange = getDateRange(90);
    const searchParams = new URLSearchParams({
      page: "1",
      size: "100",
      aggregateBy: "ACCOUNT",
      sort: "descending_perp_volume",
      start_date: formatDateRange(dateRange.from!),
      end_date: formatDateRange(dateRange.to!),
    });
    return `/v1/volume/broker/daily?${searchParams.toString()}`;
  };

  // it will use first page data cache
  const { data: top100Data } = usePrivateQuery<TradingResponse>(
    getTop100Key(),
    {
      formatter: (res) => res,
      revalidateOnFocus: false,
    }
  );

  const getUserKey = () => {
    if (!state.address) {
      return "";
    }
    const dateRange = getDateRange(90);
    const searchParams = new URLSearchParams({
      page: "1",
      size: "1",
      aggregateBy: "ACCOUNT",
      start_date: formatDateRange(dateRange.from!),
      end_date: formatDateRange(dateRange.to!),
      address: state.address,
    });
    return `/v1/volume/broker/daily?${searchParams.toString()}`;
  };

  const { data: searchData = [] } = usePrivateQuery<TradingData[]>(
    getUserKey(),
    {
      revalidateOnFocus: false,
    }
  );

  const userData = useMemo(() => {
    const index = top100Data?.rows.findIndex(
      (item) => item.address === state.address
    );

    if (!searchData.length && !isLoading) {
      return [
        {
          address: state.address,
          rank: "-",
          key: `user-${state.address?.toLowerCase()}`,
        } as unknown as TradingData,
      ];
    }

    return searchData.map((item) => ({
      ...item,
      rank:
        item.address === state.address && index !== -1 ? index! + 1 : "100+",
      key: `user-${item.address.toLowerCase()}`,
    }));
  }, [state.address, top100Data, searchData, isLoading]);

  const dataSource = useMemo(() => {
    const list = data?.rows || [];
    const total = data?.meta.total || 0;
    // add rank
    const _list = list?.map((item, index) => {
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
    return [...userData, ..._list];
  }, [data, sort, page, pageSize, searchValue, userData]);

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

  useEffect(() => {
    if (dateRange.to && dateRange.from) {
      setPage(1);
    }
  }, [dateRange]);

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
    address: state.address,
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
