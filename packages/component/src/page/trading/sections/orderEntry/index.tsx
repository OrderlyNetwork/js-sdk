import { OrderEntry } from "@/block/orderEntry";
import React, { FC, useState } from "react";
import { useOrderEntry } from "@orderly.network/hooks";
import { OrderSide } from "@orderly.network/types";

interface MyOrderEntryProps {
  symbol: string;
}

export const MyOrderEntry: FC<MyOrderEntryProps> = (props) => {
  const { symbol } = props;
  const [side, setSide] = useState(OrderSide.BUY);
  const [reduceOnly, setReduceOnly] = useState(false);

  const formState = useOrderEntry(symbol, side, reduceOnly);
  return (
    <div className="pl-1">
      <OrderEntry
        {...formState}
        showConfirm
        side={side}
        onSideChange={setSide}
        onReduceOnlyChange={setReduceOnly}
      />
    </div>
  );
};
