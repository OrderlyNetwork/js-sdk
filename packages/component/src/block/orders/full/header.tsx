import { FC, useMemo, useState } from "react";
import { Select } from "@/select";
import { modal } from "@/modal";
import { OrderSide, OrderStatus } from "@orderly.network/types";
import Button from "@/button";
import { useMutation } from "@orderly.network/hooks";

export interface Props {
  side: OrderSide;
  onSideChange: (side: OrderSide) => void;
  count: number;
  status: OrderStatus;
}

export const Header: FC<Props> = (props) => {
  const [side, setSide] = useState<OrderSide | "">("");

  const [
    cancelAll,
    { error: cancelOrderError, isMutating: cancelMutating },
  ] = useMutation("/v1/orders", "DELETE");

  function cancelAllOrder() {
    modal.confirm({
      title: "Cancel all orders",
      content: (
        <div className="orderly-text-base-contrast-54 orderly-text-2xs desktop:orderly-text-sm">
          Are you sure you want to cancel all of your pending orders?
        </div>
      ),
      contentClassName: "desktop:orderly-w-[364px]",
      onOk: async () => {
        // do cancel all orders
        // Promise.resolve();
        await cancelAll(null, { "source_type": "ALL" });
        // Promise.resolve();
      },
      onCancel: () => {
        return Promise.reject();
      },
    });
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
        value={props.side}
        onChange={(value) => {
          // console.log(value);
          // setSide(value as OrderSide);
          props.onSideChange(value as OrderSide);
          // props.onSearch?.({ side: value as OrderSide });
        }}
      />
      {
        props.status === "INCOMPLETE" && <Button
          size={"small"}
          variant={"outlined"}
          disabled={props.count <= 0}
          color={"tertiary"}
          onClick={cancelAllOrder}
        >
          Cancel all
        </Button>
      }
    </div>
  );
};
