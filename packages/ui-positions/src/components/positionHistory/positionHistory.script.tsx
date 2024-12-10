import { usePrivateQuery, useSymbolsInfo } from "@orderly.network/hooks";
import { useDataTap } from "@orderly.network/react-app";
import { AccountStatusEnum } from "@orderly.network/types";
import { PositionHistoryProps } from "./positionHistory.widget";
import { API } from "@orderly.network/types";
import { usePagination, useScreen } from "@orderly.network/ui";
import { useMemo, useState } from "react";
import { differenceInDays, setHours, subDays } from "date-fns";

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
  partial_closed = "partial close",
}

export const usePositionHistoryScript = (props: PositionHistoryProps) => {
  const { onSymbolChange, symbol } = props;
  const { data, isLoading } = usePrivateQuery<PositionHistoryExt[]>(
    "/v1/position_history?limit=1000",
    {
      formatter(data) {
        return (data.rows ?? null)?.map(
          (item: API.PositionHistory): PositionHistoryExt => {
            if (
              item.realized_pnl &&
              item.accumulated_funding_fee &&
              item.trading_fee
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
    }
  );

  const { pagination } = usePagination({
    pageSize: 10,
  });

  const { status, side, dateRange, filterItems, onFilter } = useFilter();

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
    to: new Date(),
    from: offsetEndOfDay(subDays(new Date(), 90)),
  });

  const [dateRange, setDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>(defaultRange);

  const onFilter = (filter: { name: string; value: any }) => {
    if (filter.name === "side") {
      setSide(filter.value);
    }

    if (filter.name === "status") {
      setStatus(filter.value);
    }

    if (filter.name === "dateRange") {
      setDateRange(formatDatePickerRange(filter.value));
    }
  };

  const { isMobile} = useScreen();

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
  };
};

export type PositionHistoryState = ReturnType<typeof usePositionHistoryScript>;

export const parseDateRangeForFilter = (dateRange: {
  from: Date;
  to?: Date;
}) => {
  let { from, to } = dateRange;

  if (typeof to === "undefined") {
    to = new Date();
  }

  const diff = differenceInDays(from, to);

  // console.log("diff", diff);

  if (diff === 0) {
    return [from, setHours(to, 23)];
  }

  return [from, to];
};

function offsetStartOfDay(date?: Date) {
  if (date == null) return date;

  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

function offsetEndOfDay(date?: Date) {
  if (date == null) return date;

  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
}

export const formatDatePickerRange = (option: { from?: Date; to?: Date }) => ({
  from: offsetStartOfDay(option.from),
  to: offsetEndOfDay(option.to ?? option.from),
});
