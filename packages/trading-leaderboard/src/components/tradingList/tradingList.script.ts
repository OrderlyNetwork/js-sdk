import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useAccount,
  usePrivateInfiniteQuery,
  usePrivateQuery,
} from "@orderly.network/hooks";
import { TableSort, usePagination, useScreen } from "@orderly.network/ui";
import { differenceInDays } from "date-fns";
import { getDateRange, formatDateRange } from "../../utils";
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

  const { state } = useAccount();

  const { isMobile } = useScreen();

  const { dateRange, filterDay, updateFilterDay, filterItems, onFilter } =
    useFilter();

  const { page, pageSize, setPage, parsePagination } = usePagination({
    pageSize: 100,
  });

  const getKey = (args: { page: number }) => {
    const searchParams = new URLSearchParams();

    searchParams.set("page", args.page.toString());
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

  const { data, isLoading } = usePrivateQuery<TradingResponse>(
    getKey({ page }),
    {
      formatter: (res) => res,
      revalidateOnFocus: false,
    }
  );

  const {
    data: infiniteData,
    size,
    setSize,
    isValidating,
  } = usePrivateInfiniteQuery<TradingResponse>(
    (pageIndex: number, previousPageData: any): string | null => {
      // reached the end
      if (previousPageData && !previousPageData.rows?.length) return null;

      if (!isMobile) {
        return null;
      }

      return getKey({ page: pageIndex + 1 });
    },
    {
      initialSize: 1,
      formatter: (data) => data,
      revalidateOnFocus: false,
    }
  );

  const getTop100Key = () => {
    if (!state.address) {
      return "";
    }
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

  const { data: userDataRes = [] } = usePrivateQuery<TradingData[]>(
    getUserKey(),
    {
      revalidateOnFocus: false,
    }
  );

  const getAddressRank = useCallback(
    (address: string) => {
      const index = top100Data?.rows.findIndex((item) =>
        isSameAddress(item.address, address!)
      );
      return index !== -1 ? index! + 1 : "100+";
    },
    [top100Data]
  );

  const userDataList = useMemo(() => {
    if (!state.address || isLoading) {
      return [];
    }

    if (!userDataRes.length) {
      return [
        {
          key: getRowKey(state.address!),
          address: state.address,
          rank: "-",
        } as unknown as TradingData,
      ];
    }

    return userDataRes?.map((item) => ({
      ...item,
      rank: getAddressRank(item.address!),
      key: getRowKey(item.address!),
    }));
  }, [state.address, userDataRes, isLoading, getAddressRank]);

  const addRankForList = useCallback(
    (list: TradingData[], total: number) => {
      return list?.map((item, index) => {
        let rank: string | number = index + 1;

        if (searchValue) {
          rank = getAddressRank(item.address);
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
    },
    [page, pageSize, sort, searchValue, getAddressRank]
  );

  const dataSource = useMemo(() => {
    const list = data?.rows || [];
    const total = data?.meta.total || 0;
    const rankList = addRankForList(list, total);
    if (page === 1 && !searchValue) {
      return [...userDataList, ...rankList];
    }
    return rankList;
  }, [data, page, userDataList, searchValue, addRankForList]);

  const dataList = useMemo(() => {
    if (!infiniteData?.length) {
      return [];
    }

    const total = infiniteData[0]?.meta.total || 0;
    const flatList = infiniteData?.map((item) => item.rows)?.flat();
    const rankList = addRankForList(flatList, total);

    if (!searchValue) {
      return [...userDataList, ...rankList];
    }

    return rankList;
  }, [infiniteData, userDataList, searchValue, addRankForList]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const pagination = useMemo(
    () => parsePagination(data?.meta),
    [parsePagination, data]
  );

  useEndReached(sentinelRef, () => {
    if (!isValidating && isMobile) {
      setSize(size + 1);
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
    setPage(1);
  }, [state.address]);

  useEffect(() => {
    if (dateRange.to && dateRange.from) {
      setPage(1);
    }
  }, [dateRange]);

  return {
    pagination,
    dateRange,
    filterDay,
    updateFilterDay,
    filterItems,
    onFilter,
    initialSort,
    onSort,
    dataSource,
    isLoading: isLoading || isValidating,
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

function isSameAddress(address1: string, address2: string) {
  return address1.toLowerCase() === address2.toLowerCase();
}

export function getRowKey(address: string) {
  return `current-address-${address?.toLowerCase()}`;
}
