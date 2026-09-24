import { useState } from "react";
import { OrderSide, OrderStatus } from "@orderly.network/types";
import { TabType, useOrderListScript } from "@orderly.network/ui-orders";
import type { PredictionState } from "../prediction.script";

export type ProductOrderMode = "pending" | "filled" | "history";
export type ProductOrderInstrument = "all" | "perps" | "prediction";

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
  state: PredictionState;
  mode: ProductOrderMode;
  mobile?: boolean;
};

export const useAllProductOrdersTableScript = ({
  state,
  mode,
  mobile = false,
}: UseAllProductOrdersTableScriptArgs) => {
  const pending = mode === "pending";
  const type = pending
    ? TabType.pending
    : mode === "filled"
      ? TabType.filled
      : TabType.orderHistory;
  // Widen so package DTS does not leak ui-share internal paths.
  const orderListState = useOrderListScript({
    type,
    enableLoadMore: mobile,
    ordersStatus: pending
      ? OrderStatus.INCOMPLETE
      : mode === "filled"
        ? OrderStatus.FILLED
        : undefined,
  }) as Record<string, unknown>;
  const predictionOrders = pending
    ? state.openOrders
    : mode === "filled"
      ? state.history.filter((order) => order.status === "filled")
      : [...state.openOrders, ...state.history];

  return { orderListState, predictionOrders };
};
