import { useState } from "react";
import { OrderStatus } from "@orderly.network/types";
import { TabType, useOrderListScript } from "@orderly.network/ui-orders";
import type { PredictionState } from "../prediction.script";

export type ProductOrderMode = "pending" | "filled" | "history";
export type ProductOrderInstrument = "all" | "perps" | "prediction";

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
};

export const useAllProductOrdersTableScript = ({
  state,
  mode,
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
