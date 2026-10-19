import { useMemo } from "react";
import { useOrderStream } from "@orderly.network/hooks";
import {
  filterPredictionOrders,
  isPredictionTerminalOrder,
} from "../binary/binaryOrderDisplay";

/** Legacy account history projection; display widgets use their own paginated queries. */
export function usePredictionOrderHistory(enabled: boolean) {
  const [orders, allOrdersStream] = useOrderStream(
    { size: 100, productType: "BINARY" },
    { keeplive: true, enabled, stopOnUnmount: true },
  );
  const history = useMemo(
    () =>
      enabled
        ? filterPredictionOrders(orders ?? []).filter(isPredictionTerminalOrder)
        : [],
    [orders, enabled],
  );
  return { history, allOrdersStream };
}
