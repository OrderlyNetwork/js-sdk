import { FC, useMemo, useState } from "react";
import { Select } from "@/select";
import { OrderSide } from "@/block/orderEntry/types";
import Button from "@/button";

export interface Props {
  onSearch?: () => void;
  count: number;
}

export const Header: FC<Props> = (props) => {
  const [side, setSide] = useState<OrderSide>("all");
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
        "orderly-flex orderly-justify-between orderly-items-center orderly-py-1"
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
      <Button size={"small"} variant={"outlined"} disabled={props.count <= 0}>
        Cancel all
      </Button>
    </div>
  );
};
