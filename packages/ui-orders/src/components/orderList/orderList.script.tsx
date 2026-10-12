import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  ForwardedRef,
  useImperativeHandle,
} from "react";
import { differenceInDays, setHours, subDays, format } from "date-fns";
import {
  useAccount,
  useLocalStorage,
  useOrderStream,
  useRefreshOrderCaches,
  useSymbolsInfo,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { useCanTrade, useDataTap } from "@orderly.network/react-app";
import {
  AlgoOrderRootType,
  OrderStatus,
  OrderSide,
  API,
} from "@orderly.network/types";
import { usePagination, Table } from "@orderly.network/ui";
import { SharePnLConfig } from "@orderly.network/ui-share";
import { formatSymbol, isBinarySymbol } from "@orderly.network/utils";
import { areDatesEqual } from "../../utils/util";
import { TabType } from "../orders.widget";
import {
  assertCancelAllSucceeded,
  useCancelAllConfirmation,
} from "./useCancelAllConfirmation";
import { useFormatOrderHistory } from "./useFormatOrderHistory";

export type OrderListInstance = {
  download?: () => void;
};

export type useOrderListScriptOptions = {
  type: TabType;
  /** Pause this list query while its product is hidden. */
  enabled?: boolean;
  ordersStatus?: OrderStatus;
  symbol?: string;
  /**
   * Product filter forwarded to the orders query ("PERP"/"BINARY"); omit to
   * query all products.
   * This does not add a product filter to DELETE. PERP cancel-all enumerates
   * loaded display symbols and may miss hidden symbols; BINARY cancel-all
   * without a symbol remains account-wide. Callers needing complete product
   * isolation must provide a separate cancellation workflow.
   */
  productType?: string;
  enableLoadMore?: boolean;
  /** Blocks bulk cancellation, including confirmation dialogs already open. */
  cancelAllDisabled?: boolean;
  onCancelAllAfter?: () => Promise<unknown>;
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
  const { t } = useTranslation();
  const canTrade = useCanTrade();
  const { state: account } = useAccount();
  const refreshOrders = useRefreshOrderCaches();
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

  const {
    orderStatus,
    ordersSide,
    dateRange,
    filterItems,
    onFilter,
    filterDays,
    updateFilterDays,
  } = useFilter(type, {
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
      isValidating,
      loadMore,
      cancelOrder,
      updateOrder,
      cancelAlgoOrder,
      updateAlgoOrder,
      cancelAllPendingOrders,
      cancelAllTPSLOrders,
      meta,
    },
  ] = useOrderStream(
    {
      symbol: props.symbol,
      productType: props.productType,
      status: orderStatus,
      side: ordersSide,
      page: enableLoadMore || !manualPagination ? undefined : page,
      // pending and ts_sl list get all data
      size: manualPagination ? pageSize : 500,
      sourceTypeAll: type === TabType.orderHistory || type === TabType.filled,
      dateRange,
      includes,
      excludes,
    },
    {
      enabled: props.enabled ?? true,
      stopOnUnmount: props.enabled !== undefined,
    },
  );

  const localPageSizeKey = `orderly_${type}_pageSize`;
  const [typePageSize, setTypePageSize] = useLocalStorage(
    localPageSizeKey,
    defaultPageSize,
  );

  useEffect(() => {
    if (typePageSize !== pageSize) {
      setTypePageSize(pageSize);
    }
  }, [pageSize, typePageSize]);

  const dialog = getDialogInfo(type, t, props.symbol);
  const { onCancelAll } = useCancelAllConfirmation({
    scopeKey: JSON.stringify([type, props.symbol, props.productType]),
    disabled: props.cancelAllDisabled || !canTrade,
    ...dialog,
    content: `${dialog.content} ${t("orders.cancelAll.hiddenOrders")}`,
    execute: async (isCurrent) => {
      if (!isCurrent()) return false;
      const accountId = account.accountId;
      try {
        const responses =
          type === TabType.tp_sl
            ? await cancelAllTPSLOrders(props.symbol)
            : await cancelAllPendingOrders(props.symbol);
        assertCancelAllSucceeded(responses);
        return isCurrent();
      } finally {
        await Promise.resolve()
          .then(() => refreshOrders(accountId))
          .catch(() => undefined);
      }
    },
    onSuccess: async () => {
      await props.onCancelAllAfter?.();
    },
  });

  const formattedData = useFormatOrderHistory(data ?? []);

  // Filter by symbol if symbol prop is provided (hide other symbols)
  const filteredData = useMemo(() => {
    const rawData = type !== TabType.tp_sl ? formattedData : data;
    if (!rawData) {
      return rawData;
    }
    // The product_type query only filters the REST fetch; executionreport WS
    // inserts into every orders* cache key regardless of product, so Binary
    // rows can leak into a PERP-scoped list. Strip them client-side.
    const rows =
      props.productType?.toUpperCase() === "PERP"
        ? rawData.filter(
            (order: API.AlgoOrder | API.AlgoOrderExt) =>
              !isBinarySymbol(order.symbol ?? ""),
          )
        : rawData;
    if (!props.symbol) {
      return rows;
    }
    return rows.filter(
      (order: API.AlgoOrder | API.AlgoOrderExt) =>
        order.symbol === props.symbol,
    );
  }, [type, formattedData, data, props.symbol, props.productType]);

  const dataSource =
    useDataTap(filteredData, {
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
    isValidating,
    loadMore,
    meta,
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
    filterDays,
    updateFilterDays,
    orderStatus,
    ordersSide,
    dateRange,

    symbol: props.symbol,
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
  },
) => {
  const { t } = useTranslation();
  const [orderStatus, setOrderStatus] = useState<OrderStatus | "all">(
    option.ordersStatus ?? "all",
  );
  const [ordersSide, setOrdersSide] = useState<OrderSide | "all">(
    option.filterConfig?.side ?? "all",
  );

  /// default is 90d
  const [filterDays, setFilterDays] = useState<1 | 7 | 30 | 90 | null>(90);

  const defaultRange =
    option.filterConfig?.range ??
    (type === TabType.all || type === TabType.orderHistory
      ? formatDatePickerRange({
          to: new Date(),
          from: offsetEndOfDay(subDays(new Date(), 89)),
        })
      : {});

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
    option.setPage(1);
  };

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

      const newDateRange = formatDatePickerRange(filter.value);
      if (newDateRange.from && newDateRange.to) {
        const diffDays =
          Math.abs(differenceInDays(newDateRange.from, newDateRange.to)) + 1;
        const dateRangeMap: { [key: number]: { from: Date; to: Date } } = {
          1: {
            from: offsetStartOfDay(new Date())!,
            to: offsetEndOfDay(new Date())!,
          },
          7: {
            from: offsetStartOfDay(subDays(new Date(), 6))!,
            to: offsetEndOfDay(new Date())!,
          },
          30: {
            from: offsetStartOfDay(subDays(new Date(), 29))!,
            to: offsetEndOfDay(new Date())!,
          },
          90: {
            from: offsetStartOfDay(subDays(new Date(), 89))!,
            to: offsetEndOfDay(new Date())!,
          },
        };

        const dateRange = dateRangeMap[diffDays];
        if (
          dateRange &&
          areDatesEqual(dateRange.from, newDateRange.from) &&
          areDatesEqual(dateRange.to, newDateRange.to)
        ) {
          setFilterDays(diffDays as any);
        } else {
          setFilterDays(null);
        }
      }
    }
  };

  const filterItems = useMemo((): any[] => {
    const sideFilter = {
      type: "select",
      name: "side",
      options: [
        {
          label: t("common.side.all"),
          value: "all",
        },
        {
          label: t("common.buy"),
          value: "BUY",
        },
        {
          label: t("common.sell"),
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
          label: t("common.status.all"),
          value: "all",
        },
        {
          label: t("orders.status.pending"),
          value: OrderStatus.INCOMPLETE,
        },
        {
          label: t("orders.status.filled"),
          value: OrderStatus.FILLED,
        },
        {
          label: t("orders.status.partialFilled"),
          value: OrderStatus.PARTIAL_FILLED,
        },
        {
          label: t("orders.status.canceled"),
          value: OrderStatus.CANCELLED,
        },
        {
          label: t("orders.status.rejected"),
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
  }, [type, ordersSide, orderStatus, dateRange, t]);

  return {
    filterItems,
    onFilter,
    ordersSide: ordersSide === "all" ? undefined : ordersSide,
    dateRange,
    orderStatus: orderStatus === "all" ? undefined : orderStatus,
    filterDays,
    updateFilterDays,
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

type TranslationFn = (...args: any[]) => string;

const getDialogInfo = (type: TabType, t: TranslationFn, symbol?: string) => {
  const formattedSymbol = symbol ? formatSymbol(symbol, "base") : symbol;
  switch (type) {
    case TabType.pending:
      if (symbol !== undefined) {
        return {
          title: t("orders.pending.cancelAll.forSymbol", {
            symbol: formattedSymbol,
          }),
          content: t("orders.pending.cancelAll.forSymbol.description", {
            symbol: formattedSymbol,
          }),
        };
      }
      return {
        title: t("orders.pending.cancelAll"),
        content: t("orders.pending.cancelAll.description"),
      };
    case TabType.tp_sl:
      if (symbol !== undefined) {
        return {
          title: t("orders.tpsl.cancelAll.forSymbol", {
            symbol: formattedSymbol,
          }),
          content: t("orders.tpsl.cancelAll.forSymbol.description", {
            symbol: formattedSymbol,
          }),
        };
      }
      return {
        title: t("orders.tpsl.cancelAll"),
        content: t("orders.tpsl.cancelAll.description"),
      };
    default:
      return {
        title: "",
        content: "",
      };
  }
};
