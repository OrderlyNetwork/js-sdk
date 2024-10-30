import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlgoOrderRootType,
  OrderStatus,
  OrderSide,
  API,
} from "@orderly.network/types";
import { useLocalStorage, useOrderStream } from "@orderly.network/hooks";
import { useDataTap } from "@orderly.network/react-app";
import { TabType } from "../orders.widget";
import {
  DataFilterItems,
  modal,
  usePagination,
  Text,
  PaginationMeta,
} from "@orderly.network/ui";
import { differenceInDays, setHours } from "date-fns";
import { useFormatOrderHistory } from "./useFormatOrderHistory";

export const useOrderListScript = (props: {
  type: TabType;
  ordersStatus?: OrderStatus;
  symbol?: string;
  enableLoadMore?: boolean;
  onSymbolChange?: (symbol: API.Symbol) => void;
}) => {
  const { ordersStatus, type, enableLoadMore = false, onSymbolChange } = props;

  const defaultPageSize = 50;
  const { page, pageSize, setPage, setPageSize, parseMeta } = usePagination({
    pageSize: defaultPageSize,
  });
  const { orderStatus, ordersSide, dateRange, filterItems, onFilter } =
    useFilter(type, {
      ordersStatus,
      setPage,
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
    page: enableLoadMore ? undefined : page,
    size: pageSize,
    dateRange,
    includes,
    excludes,
  });

  const localPageSizeKey = `oui-${type}_pageSize`;
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
    useDataTap(type !== TabType.tp_sl ? formattedData : data) ?? undefined;
  
  const pagination = useMemo(() => {
    return {
      ...parseMeta(meta),
      onPageChange: setPage,
      onPageSizeChange: setPageSize,
    } as PaginationMeta;
  }, [meta, setPage, setPageSize]);

  return {
    type,
    dataSource,
    isLoading,
    loadMore,
    cancelOrder,
    updateOrder,
    cancelAlgoOrder,
    updateAlgoOrder,
    page,
    pageSize,
    setPage,
    setPageSize,
    meta: parseMeta(meta),
    pagination,

    // filter
    onFilter,
    filterItems,
    onCancelAll,

    onSymbolChange,
  };
};

const useFilter = (
  type: TabType,
  option: {
    setPage: (page: number) => void;
    ordersStatus?: OrderStatus;
  }
) => {
  const [orderStatus, setOrderStatus] = useState<OrderStatus | undefined>(
    option.ordersStatus
  );
  const [ordersSide, setOrdersSide] = useState<OrderSide | undefined>(
    undefined
  );
  const [dateRange, setDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>();

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
      setDateRange(filter.value);
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
          value: undefined,
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
          value: undefined,
        },
        // {
        //   label: "Open",
        //   value: OrderStatus.OPEN,
        // },
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
        return [sideFilter, statusFilter];
    }
  }, [type, ordersSide, orderStatus, dateRange]);

  return {
    filterItems,
    onFilter,
    ordersSide,
    dateRange,
    orderStatus,
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
