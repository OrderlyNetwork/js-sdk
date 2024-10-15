import { FC } from "react";
import { cn, Flex, Grid, Text } from "@orderly.network/ui";
import { OrderBookAndEntryState } from "./orderBookAndEntry.script";
import { OrderBookWidget } from "../../base/orderBook";
import { OrderEntryWidget } from "@orderly.network/ui-order-entry";

export const OrderBookAndEntry: FC<
  OrderBookAndEntryState & {
    className?: string;
  }
> = (props) => {
  return (
    <div
      className={cn(
        "oui-grid oui-grid-cols-[4fr,6fr] oui-gap-1 oui-mx-1 ",
        props.className
      )}
    >
      <div className="oui-bg-base-9 oui-rounded-xl">
        <OrderBookWidget
          symbol={props.symbol}
          height={360}
          tabletMediaQuery={props.tabletMediaQuery}
        />
      </div>
      <div className="oui-bg-base-9 oui-rounded-xl oui-p-2">
        <OrderEntryWidget symbol={props.symbol} />
      </div>
    </div>
  );
};
