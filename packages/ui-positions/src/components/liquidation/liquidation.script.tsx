import {
  usePrivateInfiniteQuery,
  usePrivateQuery,
} from "@orderly.network/hooks";
import { useDataTap } from "@orderly.network/react-app";
import { API } from "@orderly.network/types";
import { useMemo, useState } from "react";
import {
  formatDatePickerRange,
  offsetEndOfDay,
  offsetStartOfDay,
} from "../../utils";
import { differenceInDays, subDays } from "date-fns";
import { usePagination, useScreen } from "@orderly.network/ui";
import { LiquidationProps } from "./liquidation.widget";

export const useLiquidationScript = (props: LiquidationProps) => {
  const { symbol } = props;
  const { page, pageSize, setPage, pagination, parsePagination } =
    usePagination({
      pageSize: 10,
    });

  const { dateRange, filterDays, updateFilterDays, filterItems, onFilter } =
    useFilter();

  const [data, { meta, isLoading }] = useLiquidation({
    page,
    size: pageSize,
    symbol,
    start_t: dateRange.from != null ? dateRange.from.getTime() : undefined,
    end_t: dateRange.to != null ? dateRange.to.getTime() : undefined,
  });

  const dataSource = useDataTap(data);

  const loadMore = () => {
    setPage((page) => page + 1);
  };

  return {
    dataSource,
    isLoading,
    loadMore,

    pagination,

    // filter
    dateRange,
    filterDays,
    updateFilterDays,
    filterItems,
    onFilter,
  };
};

export type LiquidationState = ReturnType<typeof useLiquidationScript>;

/**
 *
 * @param props size default is 100
 */
const useLiquidation = (props: {
  symbol?: string;
  start_t?: number;
  end_t?: number;
  page?: number;
  size?: number;
}) => {
  const ordersResponse = usePrivateInfiniteQuery<API.Liquidation>(
    generateKeyFun(props),
    {
      initialSize: 1,
      formatter: (data) => data,
    }
  );

  const meta = useMemo(() => {
    // @ts-ignore
    return ordersResponse.data?.[0]?.meta;
  }, [ordersResponse.data?.[0]]);

  const data = useMemo(() => {
    return ordersResponse.data?.map((item: any) => item.rows)?.flat();
  }, [ordersResponse.data]);

  const isLoading = ordersResponse.isLoading;

  return [data, { meta, isLoading }] as const;
};

const useFilter = () => {
  const defaultRange = formatDatePickerRange({
    to: offsetEndOfDay(new Date()),
    from: offsetEndOfDay(subDays(new Date(), 90)),
  });

  /// default is 90d
  const [filterDays, setFilterDays] = useState<1 | 7 | 30 | 90>(90);

  const [dateRange, setDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>(defaultRange);

  const updateFilterDays = (days: 1 | 7 | 30 | 90) => {
    setFilterDays(days);
    setDateRange({
      from: offsetStartOfDay(subDays(new Date(), days - 1)),
      to: offsetEndOfDay(new Date()),
    });
  };

  const onFilter = (filter: { name: string; value: any }) => {
    if (filter.name === "dateRange") {
      const newDateRange = formatDatePickerRange(filter.value);
      setDateRange(newDateRange);
      if (newDateRange.from && newDateRange.to) {
        const diffDays =
          Math.abs(differenceInDays(newDateRange.from, newDateRange.to)) + 1;
        if ([1, 7, 30, 90].includes(diffDays)) {
          setFilterDays(diffDays as any);
        }
      }
    }
  };

  const { isMobile } = useScreen();

  const filterItems = useMemo((): any[] => {
    const dateRangeFilter = {
      type: "range",
      name: "dateRange",
      value: dateRange,
    };

    if (isMobile) {
      return [dateRangeFilter];
    }
    return [dateRangeFilter];
  }, [dateRange]);

  return {
    filterItems,
    onFilter,
    dateRange,
    filterDays,
    updateFilterDays,
  };
};

const generateKeyFun =
  (args: {
    symbol?: string;
    start_t?: number;
    end_t?: number;
    page?: number;
    size?: number;
  }) =>
  (pageIndex: number, previousPageData: any): string | null => {
    // reached the end
    if (previousPageData && !previousPageData.rows?.length) return null;

    const { symbol, size = 10, page, end_t, start_t } = args;

    const search = new URLSearchParams([
      ["size", size.toString()],
      ["page", `${pageIndex + 1}`],
    ]);

    if (page) {
      search.set("page", `${page}`);
    }

    if (status) {
      search.set(`status`, status);
    }

    if (symbol) {
      search.set(`symbol`, symbol);
    }

    if (end_t) {
      search.set(`end_t`, `${end_t}`);
    }

    if (start_t) {
      search.set(`end_t`, `${start_t}`);
    }

    return `/v1/liquidations?${search.toString()}`;
  };
