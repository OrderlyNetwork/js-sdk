import { FC, useMemo, useState } from "react";
import { Select } from "@/select";
import { modal } from "@orderly.network/ui";
import {
  AlgoOrderRootType,
  OrderSide,
  OrderStatus,
} from "@orderly.network/types";
import Button from "@/button";
import { useMutation, useOrderStream } from "@orderly.network/hooks";
import toast from "react-hot-toast";

export interface Props {
  side?: OrderSide;
  onSideChange: (side: OrderSide) => void;
  count: number;
  status: OrderStatus;
  orderType?: AlgoOrderRootType;
}

export const Header: FC<Props> = (props) => {
  // const {orderType} = props;
  // const [cancelAll, { error: cancelOrderError, isMutating: cancelMutating }] =
  //   useMutation("/v1/orders", "DELETE");

  const [_, { cancelAllOrders, cancelAllTPSLOrders }] = useOrderStream({});

  function cancelAllOrder() {
    modal
      .confirm({
        title: "Cancel all orders",
        // okId: "orderly-desktop-cancel-all-orders-ok",
        // cancelId: "orderly-desktop-cancel-all-orders-cancel",
        content: (
          <div className="orderly-text-base-contrast-54 orderly-text-2xs desktop:orderly-text-sm">
            {props.orderType === AlgoOrderRootType.TP_SL
              ? "Are you sure you want to cancel all of your TP/SL orders?"
              : "Are you sure you want to cancel all of your pending order?"}
          </div>
        ),
        contentClassName: "desktop:orderly-w-[364px]",
        onOk: async () => {
          // do cancel all orders
          try {
            // await cancelAll(null, { source_type: "ALL" });
            if (props.orderType === AlgoOrderRootType.TP_SL) {
              await cancelAllTPSLOrders();
            } else {
              await cancelAllOrders();
            }
          } catch (error) {
            // @ts-ignore
            if (error?.message !== undefined) {
              // @ts-ignore
              toast.error(error.message);
            }
          } finally {
            Promise.resolve();
          }
        },
        onCancel: () => {
          return Promise.reject();
        },
      })
      .then(
        (r) => {},
        (e) => {}
      );
  }

  const options = useMemo(() => {
    return [
      { label: "All sides", value: "" },
      { label: "Buy", value: OrderSide.BUY },
      { label: "Sell", value: OrderSide.SELL },
    ];
  }, []);
  return (
    <div
      className={
        "orderly-flex orderly-justify-between orderly-items-center orderly-py-3 orderly-font-semibold"
      }
    >
      <Select
        size={"small"}
        options={options}
        value={props.side || ""}
        onChange={(value) => {
          // console.log(value);
          // setSide(value as OrderSide);
          props.onSideChange(value as OrderSide);
          // props.onSearch?.({ side: value as OrderSide });
        }}
      />
      {(props.status === "INCOMPLETE" ||
        props.orderType === AlgoOrderRootType.TP_SL) && (
        <Button
          id="orderly-desktop-cancel-all-orders"
          size={"small"}
          variant={"outlined"}
          disabled={props.count <= 0}
          color={"tertiary"}
          onClick={cancelAllOrder}
        >
          Cancel all
        </Button>
      )}
    </div>
  );
};
