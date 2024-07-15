import { OrderStatus } from "@orderly.network/types";
import { useMemo } from "react";

export const useOrderColumn = (
  status: OrderStatus = OrderStatus.INCOMPLETE
) => {
  const cols = useMemo(() => {
    return [];
  }, []);

  return cols;
};
