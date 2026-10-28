import { useState, type ComponentProps } from "react";
import { OrderSide, OrderStatus, type API } from "@orderly.network/types";
import type { DataFilterItem } from "@orderly.network/ui";
import {
  TabType,
  useOrderListScript,
  DesktopOrderList,
} from "@orderly.network/ui-orders";
import { isBinarySymbol } from "../binary/binaryInfo";
import type { PredictionAccountPanelState } from "../prediction.types";
import {
  useBinaryOrderRows,
  type BinaryOrderRowsState,
} from "./orders/useBinaryOrderRows";
import type { PredictionPerpsPanelProps } from "./perpsPanel.types";
import type { ProductOrderInstrument } from "./productOrderCancellation";
import { useProductOrderCancelAll } from "./useProductOrderCancelAll";

type PerpsOrderListState = ComponentProps<typeof DesktopOrderList>;

/** Instrument select shared by the desktop panel and mobile cards. */
export const buildProductFilterItems = (
  t: (
    key: "prediction.filter.allInstruments" | "common.perps" | "common.predict",
  ) => string,
  instrument: ProductOrderInstrument,
): DataFilterItem[] => [
  {
    type: "select",
    name: "instrument",
    value: instrument,
    options: [
      { label: t("prediction.filter.allInstruments"), value: "all" },
      { label: t("common.perps"), value: "perps" },
      { label: t("common.predict"), value: "prediction" },
    ],
  },
];

export type ProductOrderMode = "pending" | "filled" | "history";

export type { ProductOrderInstrument } from "./productOrderCancellation";

// The shared filter bar drives both the perps OrderList (OrderStatus/OrderSide
// enums) and the prediction tables (plain strings); these maps translate the
// two vocabularies in either direction. Keep the two directions in sync.
// Maps (not object literals) so unexpected keys can never hit inherited
// properties like "constructor" or "toString".
const predictionSideByOrderSide = new Map<string, string>([
  [OrderSide.BUY, "buy"],
  [OrderSide.SELL, "sell"],
]);

const orderSideByPredictionSide = new Map<string, OrderSide | "all">([
  ["buy", OrderSide.BUY],
  ["sell", OrderSide.SELL],
]);

export {
  toPredictionStatus,
  toOrderStatus,
} from "../binary/binaryOrderDisplay";

export const toPredictionSide = (value: unknown) =>
  predictionSideByOrderSide.get(String(value)) ?? "all";

export const toOrderSide = (value: unknown) =>
  orderSideByPredictionSide.get(String(value)) ?? "all";

export const useSharedProductOrdersPanelScript = () => {
  const [instrument, setInstrument] = useState<ProductOrderInstrument>("all");

  const onProductFilter = ({ value }: { name: string; value: unknown }) => {
    if (value === "all" || value === "perps" || value === "prediction") {
      setInstrument(value);
    }
  };

  return { instrument, onProductFilter };
};

export type UseAllProductOrdersTableScriptArgs = PredictionPerpsPanelProps & {
  state: PredictionAccountPanelState;
  mode: ProductOrderMode;
  mobile?: boolean;
  includePrediction?: boolean;
  instrument?: ProductOrderInstrument;
  perpsSymbol?: string;
  predictionUnderlyingSymbol?: string;
};

export interface AllProductOrdersTableState {
  orderListState: PerpsOrderListState;
  cancelAllDisabled?: boolean;
  predictionOrders: API.Order[];
  binary: BinaryOrderRowsState;
  perpsTotal: number;
  perpsHasMore: boolean;
  loadMorePerps(): void;
}

export const useAllProductOrdersTableScript = ({
  state,
  mode,
  mobile = false,
  includePrediction = true,
  instrument = includePrediction ? "all" : "perps",
  perpsSymbol,
  predictionUnderlyingSymbol,
  onSymbolChange,
  sharePnLConfig,
  pnlNotionalDecimalPrecision,
}: UseAllProductOrdersTableScriptArgs): AllProductOrdersTableState => {
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
  const rawOrderListState: PerpsOrderListState = useOrderListScript({
    type,
    onSymbolChange,
    sharePnLConfig,
    pnlNotionalDecimalPrecision,
    enabled: instrument !== "prediction",
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
  });
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
  const orderListState: PerpsOrderListState = {
    ...filteredOrderListState,
    ...cancellation.orderListProps,
    isLoading: instrument !== "prediction" && rawOrderListState.isLoading,
    isValidating: instrument !== "prediction" && rawOrderListState.isValidating,
    dataSource:
      instrument === "prediction" ? [] : filteredOrderListState.dataSource,
  };
  const binary = useBinaryOrderRows({
    mode,
    enabled: includePrediction && instrument !== "perps",
    status: rawOrderListState.orderStatus,
    side: rawOrderListState.ordersSide,
    dateRange: rawOrderListState.dateRange,
    underlyingSymbol: predictionUnderlyingSymbol,
  });
  // Footer totals count the rows actually rendered: meta.total is not
  // product-isolated under WS inserts (a binary executionreport bumps PERP-key
  // meta too), so meta-based totals can overcount the merged footer.
  const perpsTotal = orderListState.dataSource?.length ?? 0;
  const normalLoaded =
    rawOrderListState.dataSource?.filter((order) => !order.algo_order_id)
      .length ?? 0;
  // hasMore compares the pre-filter length against meta so leaked binary rows
  // inflate both sides equally; the filtered length would spin loadMore.
  const normalTotal = rawOrderListState.meta?.total ?? normalLoaded;

  return {
    orderListState,
    cancelAllDisabled: cancellation.disabled,
    predictionOrders: binary.rows,
    binary,
    perpsTotal,
    perpsHasMore: instrument !== "prediction" && normalLoaded < normalTotal,
    loadMorePerps: rawOrderListState.loadMore,
  };
};
