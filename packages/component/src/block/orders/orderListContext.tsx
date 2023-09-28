import { modal } from "@/modal";
import { API, OrderEntity } from "@orderly.network/types";
import { FC, PropsWithChildren, createContext, useCallback } from "react";

import { OrderEditFormSheet } from "./dialog/editor/editorSheet";
import { toast } from "@/toast";

export interface OrderListContextState {
  onCancelOrder: (order: API.Order) => Promise<any>;
  onEditOrder: (order: API.Order) => Promise<any>;
}

export const OrderListContext = createContext<OrderListContextState>(
  {} as OrderListContextState
);

export interface OrderListProviderProps {
  cancelOrder: (orderId: number, symbol: string) => Promise<any>;
  editOrder: (orderId: string, order: OrderEntity) => Promise<any>;
}

export const OrderListProvider: FC<
  PropsWithChildren<OrderListProviderProps>
> = (props) => {
  const { cancelOrder, editOrder } = props;

  const onCancelOrder = useCallback(async (order: API.Order) => {
    return cancelOrder(order.order_id, order.symbol).then(() => {
      toast.success("Order canceled successfully");
    });
  }, []);

  const onEditOrder = useCallback(async (order: API.Order) => {
    const orderEntry = await modal.sheet({
      title: "Edit Order",
      content: (
        <OrderEditFormSheet
          order={order}
          editOrder={(value: OrderEntity) => {
            return editOrder(order.order_id.toString(), value);
          }}
        />
      ),
    });
  }, []);

  return (
    <OrderListContext.Provider value={{ onCancelOrder, onEditOrder }}>
      {props.children}
    </OrderListContext.Provider>
  );
};
