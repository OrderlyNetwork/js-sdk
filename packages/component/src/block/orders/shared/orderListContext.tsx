import { modal } from "@/modal";
import { API, OrderEntity } from "@orderly.network/types";
import { FC, PropsWithChildren, createContext, useCallback } from "react";

import { OrderEditFormSheet } from "../dialog/editor/editorSheet";

export interface OrderListContextState {
  onCancelOrder: (order: API.Order) => Promise<any>;
  onEditOrder: (
    order: API.Order | API.AlgoOrder,
    position?: API.Position
  ) => Promise<any>;
  editOrder: (id: string, order: OrderEntity) => Promise<any>;
  editAlgoOrder: (id: string, order: OrderEntity) => Promise<any>;
}

export const OrderListContext = createContext<OrderListContextState>(
  {} as OrderListContextState
);

export interface OrderListProviderProps {
  cancelOrder: (orderId: number, symbol: string) => Promise<any>;
  editOrder: (orderId: string, order: OrderEntity) => Promise<any>;
  cancelAlgoOrder: (orderId: number, symbol: string) => Promise<any>;
  // cancelTPSLOrder: (orderId: number, rootAlgoOrderId: number) => Promise<any>;
  editAlgoOrder: (orderId: string, order: OrderEntity) => Promise<any>;
}

export const OrderListProvider: FC<
  PropsWithChildren<OrderListProviderProps>
> = (props) => {
  const {
    cancelOrder,
    editOrder,
    cancelAlgoOrder,
    editAlgoOrder,
    // cancelTPSLOrder,
  } = props;

  const onCancelOrder = useCallback(
    async (order: API.Order | API.AlgoOrder) => {
      if (order.algo_order_id !== undefined) {
        if (
          "root_algo_order_id" in order &&
          order.root_algo_order_id !== order.algo_order_id
        ) {
          return cancelAlgoOrder(order.root_algo_order_id, order.symbol);
        }

        return cancelAlgoOrder(order.algo_order_id, order.symbol).then(
          () => {}
        );
      }
      // @ts-ignore
      return cancelOrder(order.order_id, order.symbol).then(() => {
        // toast.success("Order canceled successfully");
      });
    },
    []
  );

  const onEditOrder = useCallback(
    async (order: API.Order, position?: API.Position) => {
      // @ts-ignore
      let isHidden =
        order.visible_quantity !== undefined
          ? order.visible_quantity === 0
          : order.visible !== undefined
          ? order.visible === 0
          : false;

      const orderEntry = await modal.sheet({
        title: "Edit Order",
        contentClassName: "orderly-edit-order-sheet-content",
        content: (
          <OrderEditFormSheet
            order={order}
            position={position}
            editOrder={(value: OrderEntity) => {
              if (order.algo_order_id !== undefined) {
                return editAlgoOrder(order.algo_order_id.toString(), {
                  ...value,
                });
              }
              return editOrder(order.order_id.toString(), {
                ...value,
                ...(isHidden ? { visible_quantity: 0 } : {}),
              });
            }}
          />
        ),
      });
    },
    []
  );

  return (
    <OrderListContext.Provider
      value={{ onCancelOrder, onEditOrder, editOrder, editAlgoOrder }}
    >
      {props.children}
    </OrderListContext.Provider>
  );
};
