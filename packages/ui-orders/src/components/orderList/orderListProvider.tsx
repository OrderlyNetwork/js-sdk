import { FC, PropsWithChildren, useMemo } from "react";
import { getMinNotional, useSymbolsInfo } from "@orderly.network/hooks";
import { useMemoizedFn } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { API, OrderEntity } from "@orderly.network/types";
import { modal } from "@orderly.network/ui";
import { OrderListContext, OrderListContextState } from "./orderListContext";

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
  const { t } = useTranslation();
  const symbolInfo = useSymbolsInfo();

  const onCancelOrder = useMemoizedFn(
    async (order: API.Order | API.AlgoOrder) => {
      if (order.algo_order_id !== undefined) {
        if (
          "root_algo_order_id" in order &&
          order.root_algo_order_id !== order.algo_order_id
        ) {
          return cancelAlgoOrder(order.root_algo_order_id, order.symbol);
        }

        return cancelAlgoOrder(order.algo_order_id, order.symbol).then(
          () => {},
        );
      }
      // @ts-ignore
      return cancelOrder(order.order_id, order.symbol).then(() => {
        // toast.success("Order canceled successfully");
      });
    },
  );

  const onEditOrder = useMemoizedFn(
    async (order: API.Order | API.AlgoOrder, position?: API.Position) => {
      const isHidden =
        order.visible_quantity !== undefined
          ? order.visible_quantity === 0
          : (order as any).visible !== undefined
            ? (order as any).visible === 0
            : false;
      const orderEntry = await modal.sheet({
        title: t("orders.editOrder"),
        classNames: {
          content: "oui-edit-order-sheet-content",
        },
        content: <>Content</>,
      });
    },
  );

  const checkMinNotional = useMemoizedFn(
    (symbol: string, price?: string | number, qty?: string | number) => {
      const { min_notional } = symbolInfo[symbol]();
      const minNotional = getMinNotional({ price, qty, min_notional });
      if (minNotional !== undefined) {
        return t("orderEntry.total.error.min", { value: minNotional });
      }
    },
  );

  const memoizedValue = useMemo<OrderListContextState>(() => {
    return {
      onCancelOrder,
      onEditOrder,
      editOrder,
      editAlgoOrder,
      checkMinNotional,
    };
  }, [onCancelOrder, onEditOrder, editOrder, editAlgoOrder, checkMinNotional]);

  return (
    <OrderListContext.Provider value={memoizedValue}>
      {props.children}
    </OrderListContext.Provider>
  );
};
