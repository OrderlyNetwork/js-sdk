import { useMemo } from "react";
import { useMaxQty } from "@kodiak-finance/orderly-hooks";
import { API, OrderSide } from "@kodiak-finance/orderly-types";

export function useEditOrderMaxQty(
  order: API.AlgoOrderExt,
  positionQty?: number,
) {
  const { reduce_only } = order;

  const maxQty = useMaxQty(order.symbol, order.side as OrderSide, reduce_only);

  return useMemo(() => {
    if (reduce_only) {
      return Math.abs(positionQty ?? 0);
    }
    return order.quantity + Math.abs(maxQty);
  }, [order.quantity, maxQty, reduce_only, positionQty]);
}
