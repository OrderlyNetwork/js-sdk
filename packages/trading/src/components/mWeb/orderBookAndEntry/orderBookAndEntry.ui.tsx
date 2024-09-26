import { FC } from "react";
import { cn, Flex, Grid, Text } from "@orderly.network/ui";
import { OrderBookAndEntryState } from "./orderBookAndEntry.script";
import { OrderBookWidget } from "../../base/orderBook";

export const OrderBookAndEntry: FC<
  OrderBookAndEntryState & {
    className?: string;
  }
> = (props) => {
  return (
    <div
      className={cn(
        "oui-bg-base-9 oui-grid oui-grid-cols-[4fr,6fr] oui-gap-1",
        props.className
      )}
    >
      <OrderBookWidget symbol={props.symbol} height={360} />

      <div>Order Entry</div>
    </div>
  );
};
