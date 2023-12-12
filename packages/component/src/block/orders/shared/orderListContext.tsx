import { modal } from "@/modal";
import { API, OrderEntity } from "@orderly.network/types";
import { FC, PropsWithChildren, createContext, useCallback } from "react";

import { OrderEditFormSheet } from "../dialog/editor/editorSheet";
import { toast } from "@/toast";
import { commify } from "@orderly.network/utils";

export interface OrderListContextState {
  onCancelOrder: (order: API.Order) => Promise<any>;
  onEditOrder: (order: API.Order) => Promise<any>;
  onConfirm: (
    data: OrderEntity,
    dirtyFields: Partial<OrderEntity>
  ) => Promise<any>;
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
      // toast.success("Order canceled successfully");
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

  const onConfirm = (data: OrderEntity, dirtyFields: any) => {
    let alertText;

    if (dirtyFields["order_price"] && dirtyFields["order_quantity"]) {
      alertText = (
        <div className="orderly-text-base-contrast-54 orderly-text-2xs desktop:orderly-text-sm">
          You agree changing the price of {base}-PERP order to{" "}
          <span className="orderly-text-warning">
            {commify(data.order_price!)}
          </span>{" "}
          and the quantity to{" "}
          <span className="orderly-text-warning">
            {commify(data.order_quantity!)}
          </span>
          .
        </div>
      );
    } else {
      if (dirtyFields["order_price"]) {
        alertText = (
          <div className="orderly-text-base-contrast-54 orderly-text-2xs desktop:orderly-text-sm">
            You agree changing the price of {base}-PERP order to{" "}
            <span className="orderly-text-warning">
              {commify(data.order_price!)}
            </span>
            .
          </div>
        );
      }

      if (dirtyFields["order_quantity"]) {
        alertText = (
          <div className="orderly-text-base-contrast-54 orderly-text-2xs desktop:orderly-text-sm">
            You agree changing the quantity of {base}-PERP order to{" "}
            <span className="orderly-text-warning">
              {commify(data.order_quantity!)}
            </span>
            .
          </div>
        );
      }
    }

    return modal.confirm({
      title: "Edit Order",
      content: alertText,
      contentClassName: "desktop:orderly-w-[340px]",
      onOk: () => Promise.resolve(data),
      onCancel: () => {
        return Promise.reject();
      },
    });
  };
  return (
    <OrderListContext.Provider
      value={{ onCancelOrder, onEditOrder, onConfirm }}
    >
      {props.children}
    </OrderListContext.Provider>
  );
};
