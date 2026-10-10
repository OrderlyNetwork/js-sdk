import { useMemo } from "react";
import { useOrderStream } from "@orderly.network/hooks";
import {
  normalizePredictionOrders,
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
        ? normalizePredictionOrders(orders ?? []).filter(
            isPredictionTerminalOrder,
          )
        : [],
    [orders, enabled],
  );
  return { history, allOrdersStream };
}
