import { useState } from "react";
import { OrderSide, OrderStatus } from "@orderly.network/types";
import { TabType, useOrderListScript } from "@orderly.network/ui-orders";
import { isBinarySymbol } from "../binary/binaryInfo";
import type { PredictionAccountPanelState } from "../prediction.types";
import { useBinaryOrderRows } from "./orders/useBinaryOrderRows";
import type { ProductOrderInstrument } from "./productOrderCancellation";
import { useProductOrderCancelAll } from "./useProductOrderCancelAll";

export type ProductOrderMode = "pending" | "filled" | "history";

export type { ProductOrderInstrument } from "./productOrderCancellation";

// The shared filter bar drives both the perps OrderList (OrderStatus/OrderSide
// enums) and the prediction tables (plain strings); these maps translate the
// two vocabularies in either direction. Keep the two directions in sync.
const predictionStatusByOrderStatus: Record<string, string> = {
  [OrderStatus.INCOMPLETE]: "pending",
  [OrderStatus.FILLED]: "filled",
  [OrderStatus.PARTIAL_FILLED]: "partialFilled",
  [OrderStatus.CANCELLED]: "cancelled",
  [OrderStatus.REJECTED]: "rejected",
};

const orderStatusByPredictionStatus: Record<string, OrderStatus | "all"> = {
  pending: OrderStatus.INCOMPLETE,
  filled: OrderStatus.FILLED,
  partialFilled: OrderStatus.PARTIAL_FILLED,
  cancelled: OrderStatus.CANCELLED,
  rejected: OrderStatus.REJECTED,
};

const predictionSideByOrderSide: Record<string, string> = {
  [OrderSide.BUY]: "buy",
  [OrderSide.SELL]: "sell",
};

const orderSideByPredictionSide: Record<string, OrderSide | "all"> = {
  buy: OrderSide.BUY,
  sell: OrderSide.SELL,
};

export const toPredictionStatus = (value: unknown) =>
  predictionStatusByOrderStatus[String(value)] ?? "all";

export const toOrderStatus = (value: unknown) =>
  orderStatusByPredictionStatus[String(value)] ?? "all";

export const toPredictionSide = (value: unknown) =>
  predictionSideByOrderSide[String(value)] ?? "all";

export const toOrderSide = (value: unknown) =>
  orderSideByPredictionSide[String(value)] ?? "all";

export const useSharedProductOrdersPanelScript = () => {
  const [instrument, setInstrument] = useState<ProductOrderInstrument>("all");

  const onProductFilter = ({ value }: { name: string; value: unknown }) => {
    if (value === "all" || value === "perps" || value === "prediction") {
      setInstrument(value);
    }
  };

  return { instrument, onProductFilter };
};

export type UseAllProductOrdersTableScriptArgs = {
  state: PredictionAccountPanelState;
  mode: ProductOrderMode;
  mobile?: boolean;
  includePrediction?: boolean;
  instrument?: ProductOrderInstrument;
  perpsSymbol?: string;
  predictionUnderlyingSymbol?: string;
};

export const useAllProductOrdersTableScript = ({
  state,
  mode,
  mobile = false,
  includePrediction = true,
  instrument = includePrediction ? "all" : "perps",
  perpsSymbol,
  predictionUnderlyingSymbol,
}: UseAllProductOrdersTableScriptArgs) => {
  const pending = mode === "pending";
  const cancellation = useProductOrderCancelAll({
    binary: state,
    enabled: pending,
    instrument,
    perpsSymbol,
    predictionUnderlyingSymbol,
  });
  const type = pending
    ? TabType.pending
    : mode === "filled"
      ? TabType.filled
      : TabType.orderHistory;
  // Widen so package DTS does not leak ui-share internal paths.
  const rawOrderListState = useOrderListScript({
    type,
    enableLoadMore: mobile || includePrediction,
    // The perps stream must exclude binary rows: this panel appends the
    // binary rows itself as supplementalRows, so an unfiltered query would
    // show every binary order twice in the "all" view.
    productType: "PERP",
    symbol: perpsSymbol,
    cancelAllDisabled: cancellation.disabled,
    ordersStatus: pending
      ? OrderStatus.INCOMPLETE
      : mode === "filled"
        ? OrderStatus.FILLED
        : undefined,
  }) as Record<string, unknown> & {
    dataSource?: { symbol?: string }[] | null;
  };
  // The product_type query only filters the REST fetch; executionreport WS
  // inserts into every orders* cache key regardless of product, and those
  // mutations skip revalidation — so binary rows can linger in the perps
  // list. Filter them out client-side as a belt-and-braces guard.
  const pollutedRows = rawOrderListState.dataSource?.filter((order) =>
    isBinarySymbol(order.symbol ?? ""),
  );
  const filteredOrderListState =
    pollutedRows && pollutedRows.length > 0
      ? {
          ...rawOrderListState,
          dataSource: rawOrderListState.dataSource?.filter(
            (order) => !isBinarySymbol(order.symbol ?? ""),
          ),
        }
      : rawOrderListState;
  const orderListState: typeof rawOrderListState &
    typeof cancellation.orderListProps = {
    ...filteredOrderListState,
    ...cancellation.orderListProps,
  };
  const binary = useBinaryOrderRows({
    mode,
    status:
      rawOrderListState.orderStatus === "all"
        ? undefined
        : (rawOrderListState.orderStatus as OrderStatus | undefined),
    side:
      rawOrderListState.ordersSide === "all"
        ? undefined
        : (rawOrderListState.ordersSide as OrderSide | undefined),
    dateRange: rawOrderListState.dateRange as
      | { from?: Date; to?: Date }
      | undefined,
    underlyingSymbol: predictionUnderlyingSymbol,
  });
  // Footer totals count the rows actually rendered: meta.total is not
  // product-isolated under WS inserts (a binary executionreport bumps PERP-key
  // meta too), so meta-based totals can overcount the merged footer.
  const perpsTotal = orderListState.dataSource?.length ?? 0;
  const normalLoaded =
    rawOrderListState.dataSource?.filter(
      (order) => !(order as { algo_order_id?: number }).algo_order_id,
    ).length ?? 0;
  // hasMore compares the pre-filter length against meta so leaked binary rows
  // inflate both sides equally; the filtered length would spin loadMore.
  const normalTotal =
    (rawOrderListState.meta as { total?: number } | undefined)?.total ??
    normalLoaded;

  return {
    orderListState,
    cancelAllDisabled: cancellation.disabled,
    predictionOrders: binary.rows,
    binary,
    perpsTotal,
    perpsHasMore: normalLoaded < normalTotal,
    loadMorePerps: rawOrderListState.loadMore as () => void,
  };
};
