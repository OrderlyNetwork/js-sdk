import { usePrivateQuery, useSymbolsInfo } from "@orderly.network/hooks";
import { useDataTap } from "@orderly.network/react-app";
import { AccountStatusEnum } from "@orderly.network/types";
import { PositionHistoryProps } from "./positionHistory.widget";
import { API } from "@orderly.network/types";
import { usePagination, useScreen } from "@orderly.network/ui";
import { useEffect, useMemo, useState } from "react";
import { differenceInDays, setDate, setHours, subDays } from "date-fns";
import { formatDatePickerRange, offsetEndOfDay, offsetStartOfDay } from "../../utils";

export type PositionHistoryExt = API.PositionHistory & {
  netPnL?: number;
};

export enum PositionHistorySide {
  all = "all",
  buy = "LONG",
  sell = "SHORT",
}
export enum PositionHistoryStatus {
  all = "all",
  closed = "closed",
  partial_closed = "partial_closed",
}

export const usePositionHistoryScript = (props: PositionHistoryProps) => {
  const { onSymbolChange, symbol, pnlNotionalDecimalPrecision } = props;
  const { data, isLoading } = usePrivateQuery<PositionHistoryExt[]>(
    symbol ? `/v1/position_history?symbol=${symbol}&limit=1000` : "/v1/position_history?limit=1000",
    {
      formatter(data) {
        return (data.rows ?? null)?.map(
          (item: API.PositionHistory): PositionHistoryExt => {
            if (
              item.realized_pnl != null &&
              item.accumulated_funding_fee != null &&
              item.trading_fee != null
            ) {
              const netPnL =
                item.realized_pnl -
                item.accumulated_funding_fee -
                item.trading_fee;
              return {
                ...item,
                netPnL: netPnL,
              };
            }
            return item;
          }
        );
      },
      revalidateOnFocus: true,
    }
  );

  const { pagination, setPage } = usePagination({
    pageSize: 10,
  });

  const {
    status,
    side,
    dateRange,
    filterDays,
    updateFilterDays,
    filterItems,
    onFilter,
  } = useFilter();

  useEffect(() => {
    setPage(1);
  }, [status, side, dateRange, filterDays]);

  const filterData = useMemo(() => {
    if (data == null) return data;

    return data.filter((item) => {
      const sideFilter =
        side === PositionHistorySide.all
          ? true
          : item.side.toLowerCase() === side.toLowerCase();
      const statusFilter =
        status === PositionHistoryStatus.all
          ? true
          : item.position_status.toLowerCase() === status.toLowerCase();

      // const time = item.close_timestamp ?? item?.last_update_timestamp ?? item.open_timestamp;
      const time = item?.last_update_time ?? item.open_timestamp;
      const dateFilter =
        dateRange.from && dateRange.to
          ? time >= dateRange.from.getTime() && time <= dateRange.to.getTime()
          : true;

      const symbolFilter = symbol ? item.symbol == symbol : true;

      return sideFilter && statusFilter && dateFilter && symbolFilter;
    });
  }, [status, side, dateRange, data, symbol]);

  const dataSource = useDataTap(filterData, {
    accountStatus: AccountStatusEnum.EnableTrading,
  });

  return {
    dataSource,
    isLoading,
    onSymbolChange,
    pagination,
    filterItems,
    onFilter,
    symbol,
    filterDays,
    updateFilterDays,
    pnlNotionalDecimalPrecision,
  };
};

const useFilter = () => {
  const [status, setStatus] = useState<PositionHistoryStatus>(
    PositionHistoryStatus.all
  );
  const [side, setSide] = useState<PositionHistorySide>(
    PositionHistorySide.all
  );

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
    if (filter.name === "side") {
      setSide(filter.value);
    }

    if (filter.name === "status") {
      setStatus(filter.value);
    }

    if (filter.name === "dateRange") {
      const newDateRange = formatDatePickerRange(filter.value);
      setDateRange(newDateRange);
      if (newDateRange.from && newDateRange.to)
      {
        const diffDays = Math.abs(differenceInDays(newDateRange.from, newDateRange.to)) + 1;        
        if ([1,7,30,90].includes(diffDays)) {
          setFilterDays(diffDays as any);
        }
      }
    }
  };

  const { isMobile } = useScreen();

  const filterItems = useMemo((): any[] => {
    const sideFilter = {
      type: "select",
      name: "side",
      options: [
        {
          label: "All sides",
          value: "all",
        },
        {
          label: "Buy",
          value: PositionHistorySide.buy,
        },
        {
          label: "Sell",
          value: PositionHistorySide.sell,
        },
      ],
      value: side,
    };

    const dateRangeFilter = {
      type: "range",
      name: "dateRange",
      value: dateRange,
    };

    const statusFilter = {
      type: "select",
      name: "status",
      options: [
        {
          label: "All status",
          value: "all",
        },
        {
          label: "Closed",
          value: PositionHistoryStatus.closed,
        },
        {
          label: "Partial closed",
          value: PositionHistoryStatus.partial_closed,
        },
      ],
      value: status,
    };

    if (isMobile) {
      return [sideFilter, statusFilter];
    }
    return [sideFilter, statusFilter, dateRangeFilter];
  }, [side, status, dateRange]);  

  return {
    filterItems,
    onFilter,
    side,
    dateRange,
    status,
    filterDays,
    updateFilterDays,
  };
};

export type PositionHistoryState = ReturnType<typeof usePositionHistoryScript>;
