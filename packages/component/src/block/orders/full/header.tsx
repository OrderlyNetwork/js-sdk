import { FC, useMemo, useState } from "react";
import { Select } from "@/select";
import { OrderSide } from "@/block/orderEntry/types";

export interface Props {
  onSearch?: () => void;
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
    <div>
      <Select
        options={options}
        value={side}
        onChange={(value) => {
          console.log(value);
          setSide(value as OrderSide);
        }}
      />
    </div>
  );
};
