import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  ForwardedRef,
  useImperativeHandle,
} from "react";
import {
  AlgoOrderRootType,
  OrderStatus,
  OrderSide,
  API,
} from "@orderly.network/types";
import {
  useLocalStorage,
  useOrderStream,
  useSymbolsInfo,
} from "@orderly.network/hooks";
import { useDataTap } from "@orderly.network/react-app";
import { TabType } from "../orders.widget";
import { modal, usePagination, Text, Table } from "@orderly.network/ui";
import { differenceInDays, setHours, subDays, format } from "date-fns";
import { useFormatOrderHistory } from "./useFormatOrderHistory";
import { SharePnLConfig } from "@orderly.network/ui-share";

export type OrderListInstance = {
  download?: () => void;
};

export type useOrderListScriptOptions = {
  type: TabType;
  ordersStatus?: OrderStatus;
  symbol?: string;
  enableLoadMore?: boolean;
  onSymbolChange?: (symbol: API.Symbol) => void;
  sharePnLConfig?: SharePnLConfig;
  filterConfig?: {
    side?: OrderSide | "all";
    range?: {
      from?: Date;
      to?: Date;
    };
  };
  pnlNotionalDecimalPrecision?: number;
  ref?: ForwardedRef<OrderListInstance>;
};

export const useOrderListScript = (props: useOrderListScriptOptions) => {
  const {
    ordersStatus,
    type,
    enableLoadMore = false,
    onSymbolChange,
    filterConfig,
    pnlNotionalDecimalPrecision,
    sharePnLConfig,
  } = props;

  const symbolsInfo = useSymbolsInfo();

  const manualPagination = useMemo(() => {
    // pending and ts_sl list use client pagination
    return ordersStatus !== OrderStatus.INCOMPLETE;
  }, [ordersStatus]);

  const defaultPageSize = 50;
  const { page, pageSize, setPage, pagination, parsePagination } =
    usePagination({
      pageSize: defaultPageSize,
    });

  // when symbol change, reset page
  useEffect(() => {
    setPage(1);
  }, [props.symbol]);

  const { orderStatus, ordersSide, dateRange, filterItems, onFilter } =
    useFilter(type, {
      ordersStatus,
      setPage,
      filterConfig,
    });

  const includes = useMemo(() => {
    if (type === TabType.tp_sl) {
      return [AlgoOrderRootType.POSITIONAL_TP_SL, AlgoOrderRootType.TP_SL];
    }
    return undefined;
  }, [type]);

  const excludes = useMemo(() => {
    if (type === TabType.pending) {
      return [AlgoOrderRootType.POSITIONAL_TP_SL, AlgoOrderRootType.TP_SL];
    }
    return undefined;
  }, [type]);

  const tableInstance = useRef<Table<any>>();

  useImperativeHandle(props.ref, () => ({
    download: () => {
      const filename = `orders_${format(new Date(), "yyyyMMdd_HHmmss")}`;
      tableInstance.current?.download(filename);
    },
  }));

  const [
    data,
    {
      isLoading,
      loadMore,
      cancelOrder,
      updateOrder,
      cancelAlgoOrder,
      updateAlgoOrder,
      cancelAllOrders,
      cancelAllTPSLOrders,
      meta,
      refresh,
    },
  ] = useOrderStream({
    symbol: props.symbol,
    status: orderStatus,
    side: ordersSide,
    page: enableLoadMore || !manualPagination ? undefined : page,
    // pending and ts_sl list get all data
    size: manualPagination ? pageSize : 500,
    dateRange,
    includes,
    excludes,
  });

  const localPageSizeKey = `orderly_${type}_pageSize`;
  const [typePageSize, setTypePageSize] = useLocalStorage(
    localPageSizeKey,
    defaultPageSize
  );

  useEffect(() => {
    if (typePageSize !== pageSize) {
      setTypePageSize(pageSize);
    }
  }, [pageSize, typePageSize]);

  const onCancelAll = useCallback(() => {
    const title =
      props.type === TabType.pending
        ? "Cancel all pending orders"
        : props.type === TabType.tp_sl
        ? "Cancel all TP/SL orders"
        : "";
    const content = TabType.pending
      ? "Are you sure you want to cancel all of your pending orders?"
      : props.type === TabType.tp_sl
      ? "Are you sure you want to cancel all of your TP/SL orders?"
      : "";

    modal.confirm({
      title: title,
      content: <Text size="sm">{content}</Text>,
      onCancel: async () => {},
      onOk: async () => {
        try {
          // await cancelAll(null, { source_type: "ALL" });
          if (type === TabType.tp_sl) {
            await cancelAllTPSLOrders();
          } else {
            await cancelAllOrders();
          }
          refresh();
          return Promise.resolve(true);
        } catch (error) {
          // @ts-ignore
          if (error?.message !== undefined) {
            // @ts-ignore
            toast.error(error.message);
          }
          return Promise.resolve(false);
        } finally {
          Promise.resolve();
        }
      },
    });
  }, [type]);

  const formattedData = useFormatOrderHistory(data ?? []);

  const dataSource =
    useDataTap(type !== TabType.tp_sl ? formattedData : data, {
      fallbackData: [],
    }) ?? undefined;

  const _pagination = useMemo(() => {
    if (manualPagination) {
      return parsePagination(meta);
    }
    return pagination;
  }, [meta, manualPagination, parsePagination, pagination]);

  return {
    type,
    dataSource,
    isLoading,
    loadMore,
    cancelOrder,
    updateOrder,
    cancelAlgoOrder,
    updateAlgoOrder,
    pagination: _pagination,
    manualPagination,
    pnlNotionalDecimalPrecision,

    // filter
    onFilter,
    filterItems,
    onCancelAll,

    onSymbolChange,

    sharePnLConfig,
    tableInstance,
    symbolsInfo,
  };
};

const useFilter = (
  type: TabType,
  option: {
    ordersStatus?: OrderStatus | "all";
    setPage: (page: number) => void;
    filterConfig?: {
      side?: OrderSide | "all";
      range?: {
        from?: Date;
        to?: Date;
      };
    };
  }
) => {
  const [orderStatus, setOrderStatus] = useState<OrderStatus | "all">(
    option.ordersStatus ?? "all"
  );
  const [ordersSide, setOrdersSide] = useState<OrderSide | "all">(
    option.filterConfig?.side ?? "all"
  );

  const defaultRange =
    option.filterConfig?.range ??
    (type === TabType.all || type === TabType.orderHistory
      ? formatDatePickerRange({
          to: new Date(),
          from: offsetEndOfDay(subDays(new Date(), 7)),
        })
      : {});

  const [dateRange, setDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>(defaultRange);

  const onFilter = (filter: { name: string; value: any }) => {
    if (filter.name === "side") {
      setOrdersSide(filter.value);
      option.setPage(1);
    }

    if (filter.name === "status") {
      setOrderStatus(filter.value);
      option.setPage(1);
    }

    if (filter.name === "dateRange") {
      setDateRange(formatDatePickerRange(filter.value));
      option.setPage(1);
    }
  };

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
          value: "BUY",
        },
        {
          label: "Sell",
          value: "SELL",
        },
      ],
      value: ordersSide,
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
          label: "Pending",
          value: OrderStatus.INCOMPLETE,
        },
        {
          label: "Filled",
          value: OrderStatus.FILLED,
        },
        {
          label: "Partial filled",
          value: OrderStatus.PARTIAL_FILLED,
        },
        {
          label: "Canceled",
          value: OrderStatus.CANCELLED,
        },
        {
          label: "Rejected",
          value: OrderStatus.REJECTED,
        },
      ],
      value: orderStatus,
    };
    switch (type) {
      case TabType.all:
        return [sideFilter, statusFilter, dateRangeFilter];
      case TabType.pending:
        return [sideFilter];
      case TabType.tp_sl:
        return [sideFilter];
      case TabType.filled:
        return [sideFilter];
      case TabType.cancelled:
        return [sideFilter];
      case TabType.rejected:
        return [sideFilter];
      case TabType.orderHistory:
        return [sideFilter, statusFilter, dateRangeFilter];
    }
  }, [type, ordersSide, orderStatus, dateRange]);

  return {
    filterItems,
    onFilter,
    ordersSide: ordersSide === "all" ? undefined : ordersSide,
    dateRange,
    orderStatus: orderStatus === "all" ? undefined : orderStatus,
  };
};

export type OrdersBuilderState = ReturnType<typeof useOrderListScript>;
export type FilterState = ReturnType<typeof useFilter>;

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
