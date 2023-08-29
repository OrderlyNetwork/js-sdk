import { OrderEntry } from "@/block/orderEntry";
import React, { FC } from "react";
import { useOrderEntry } from "@orderly.network/hooks";

interface MyOrderEntryProps {
  symbol: string;
}

export const MyOrderEntry: FC<MyOrderEntryProps> = (props) => {
  const { symbol } = props;
  const formState = useOrderEntry(symbol);
  return (
    <div className="pl-1">
      <OrderEntry {...formState} showConfirm />
    </div>
  );
};
