import { FC } from "react";
import { Flex, Grid, Text } from "@orderly.network/ui";
import { OrderBookAndEntryState } from "./orderBookAndEntry.script";
import { OrderBookWidget } from "../../base/orderBook";

export const OrderBookAndEntry: FC<OrderBookAndEntryState> = (props) => {
  return (
    <div
      className="oui-bg-base-9 oui-grid oui-grid-cols-[4fr,6fr] oui-gab-1 oui-mt-2 oui-mx-1 oui-rounded-xl"
    >
      
        <OrderBookWidget symbol={props.symbol} height={360} />
      
      <div >Order Entry</div>
    </div>
  );
};
