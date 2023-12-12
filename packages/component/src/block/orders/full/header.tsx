import { FC, useMemo, useState } from "react";
import { Select } from "@/select";
import { OrderSide } from "@/block/orderEntry/types";
import Button from "@/button";
import { modal } from "@/modal";

export interface Props {
  onSearch?: () => void;
  count: number;
}

export const Header: FC<Props> = (props) => {
  const [side, setSide] = useState<OrderSide>("all");


  function cancelAllOrder() {
    modal.confirm({
      title: "Cancel all orders",
      content: (<div className="orderly-text-base-contrast-54 orderly-text-2xs desktop:orderly-text-sm">
        Are you sure you want to cancel all of your pending orders?
      </div>),
      contentClassName: "desktop:orderly-w-[364px]",
      onOk: async () => {
        // do cancel all orders
        Promise.resolve();
      },
      onCancel: () => {
        return Promise.reject();
      },
    });
  }

  const options = useMemo(() => {
    return [
      { label: "All sides", value: "all" },
      { label: "Buy", value: OrderSide.Buy },
      { label: "Sell", value: OrderSide.Sell },
    ];
  }, []);
  return (
    <div
      className={
        "orderly-flex orderly-justify-between orderly-items-center orderly-py-3"
      }
    >
      <Select
        size={"small"}
        options={options}
        value={side}
        onChange={(value) => {
          console.log(value);
          setSide(value as OrderSide);
        }}
      />
      <Button
        size={"small"}
        variant={"outlined"}
        disabled={props.count <= 0}
        color={"tertiary"}
        onClick={cancelAllOrder}
      >
        Cancel all
      </Button>
    </div>
  );
};
