import { modal } from "@orderly.network/ui";
import { API, OrderEntity } from "@orderly.network/types";
import { FC, PropsWithChildren, createContext, useCallback, useContext } from "react";

import { checkNotional, useSymbolsInfo } from "@orderly.network/hooks";

export interface OrderListContextState {
  onCancelOrder: (order: API.Order | API.AlgoOrder) => Promise<any>;
  onEditOrder: (
    order: API.Order | API.AlgoOrder,
    position?: API.Position
  ) => Promise<any>;
  editOrder: (id: string, order: OrderEntity) => Promise<any>;
  editAlgoOrder: (id: string, order: OrderEntity) => Promise<any>;
  checkMinNotional: (
    symbol: string,
    price?: string | number,
    qty?: string | number
  ) => string | undefined;
}

export const OrderListContext = createContext<OrderListContextState>(
  {} as OrderListContextState
);

export const useOrderListContext = () => {
  return useContext(OrderListContext);
}

export interface OrderListProviderProps {
  cancelOrder: (orderId: number, symbol: string) => Promise<any>;
  editOrder: (orderId: string, order: OrderEntity) => Promise<any>;
  cancelAlgoOrder: (orderId: number, symbol: string) => Promise<any>;
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
  const symbolInfo = useSymbolsInfo();
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
    async (order: API.Order | API.AlgoOrder, position?: API.Position) => {
      // @ts-ignore
      let isHidden =
        order.visible_quantity !== undefined
          ? order.visible_quantity === 0
          : (order as any).visible !== undefined
          ? (order as any).visible === 0
          : false;

      const orderEntry = await modal.sheet({
        title: "Edit Order",
        classNames: {
          content: "oui-edit-order-sheet-content",
        },
        content: (
          // <OrderEditFormSheet
          //   order={order}
          //   position={position}
          //   editOrder={(value: OrderEntity) => {
          //     /// check order has order_tag, if exits add order_tag to request body
          //     if (
          //       typeof order.order_tag !== undefined &&
          //       order.reduce_only !== true
          //     ) {
          //       value = { ...value, order_tag: order.order_tag };
          //     }
          //     if (order.algo_order_id !== undefined) {
          //       return editAlgoOrder(order.algo_order_id.toString(), {
          //         ...value,
          //       });
          //     }
          //     return editOrder((order as any).order_id.toString(), {
          //       ...value,
          //       ...(isHidden ? { visible_quantity: 0 } : {}),
          //     });
          //   }}
          // />
          <>Content</>
        ),
      });
    },
    []
  );

  const checkMinNotional = useCallback(
    (symbol: string, price?: string | number, qty?: string | number) => {
      const { min_notional } = symbolInfo[symbol]();
      return checkNotional(price, qty, min_notional);
    },
    [symbolInfo]
  );

  return (
    <OrderListContext.Provider
      value={{
        onCancelOrder,
        onEditOrder,
        editOrder,
        editAlgoOrder,
        checkMinNotional,
      }}
    >
      {props.children}
    </OrderListContext.Provider>
  );
};
