import type { API } from "@orderly.network/types";
import { type FC, useContext } from "react";
import { OrderListContext } from "../shared/orderListContext";
import { OrderCancelButton } from "@/block/commons/orderCancelButton";

export const CancelButton: FC<{
  order: API.Order;
}> = (props) => {
  const { order } = props;
  const { onCancelOrder } = useContext(OrderListContext);

  return (
    <OrderCancelButton<API.Order> order={order} onCancelOrder={onCancelOrder} />
  );
};
