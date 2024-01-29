import { modal } from "@/modal";
import { API, OrderEntity } from "@orderly.network/types";
import { FC, PropsWithChildren, createContext, useCallback } from "react";

import { OrderEditFormSheet } from "../dialog/editor/editorSheet";

export interface OrderListContextState {
  onCancelOrder: (order: API.Order) => Promise<any>;
  onEditOrder: (order: API.Order) => Promise<any>;
  editOrder: (id: string, order: OrderEntity) => Promise<any>;
}

export const OrderListContext = createContext<OrderListContextState>(
  {} as OrderListContextState
);

export interface OrderListProviderProps {
  cancelOrder: (orderId: number | OrderEntity, symbol: string) => Promise<any>;
  editOrder: (orderId: string, order: OrderEntity) => Promise<any>;
}

export const OrderListProvider: FC<
  PropsWithChildren<OrderListProviderProps>
> = (props) => {
  const { cancelOrder, editOrder } = props;

  const onCancelOrder = useCallback(async (order: API.Order) => {
    // @ts-ignore
    return cancelOrder(order, order.symbol).then(() => {
      // toast.success("Order canceled successfully");
    });
  }, []);

  const onEditOrder = useCallback(async (order: API.Order) => {
    const orderEntry = await modal.sheet({
      title: "Edit Order",
      contentClassName: "orderly-edit-order-sheet-content",
      content: (
        <OrderEditFormSheet
          order={order}
          editOrder={(value: OrderEntity) => {
            const order_id = (order?.order_id || order?.algo_order_id)?.toString();
            return editOrder(order_id || "", {...value, algo_order_id: order.algo_order_id});
          }}
        />
      ),
    });
  }, []);

  return (
    <OrderListContext.Provider
      value={{ onCancelOrder, onEditOrder, editOrder }}
    >
      {props.children}
    </OrderListContext.Provider>
  );
};
