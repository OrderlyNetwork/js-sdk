import { useMemo, useState } from "react";
import {
  AlgoOrderRootType,
  OrderStatus,
  OrderSide,
} from "@orderly.network/types";
import { useOrderStream } from "@orderly.network/hooks";
import { TabType } from "../orders.widget";
import { DataFilterItems, usePagination } from "@orderly.network/ui";
import { differenceInDays, setHours } from "date-fns";

export const useOrderListScript = (props: {
  type: TabType;
  ordersStatus?: OrderStatus;
  symbol?: string;
}) => {
  const { ordersStatus, type } = props;

  const { page, pageSize, setPage, setPageSize, parseMeta } = usePagination();
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
      meta,
    },
  ] = useOrderStream({
    symbol: props.symbol,
    status: orderStatus,
    side: ordersSide,
    page: page,
    size: pageSize,
    dateRange,
    includes,
    excludes,
  });

  return {
    type,
    dataSource: data,
    isLoading,
    loadMore,
    cancelOrder,
    updateOrder,
    cancelAlgoOrder,
    updateAlgoOrder,

    // pagination
    page,
    pageSize,
    setPage,
    setPageSize,
    meta: parseMeta(meta),

    // filter
    onFilter,
    filterItems,
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
        {
          label: "Pending",
          value: OrderStatus.INCOMPLETE,
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
        return [sideFilter];
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
