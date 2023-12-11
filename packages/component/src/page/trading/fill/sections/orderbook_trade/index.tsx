import {
  MemorizedOrderBook,
  MyOrderBook,
} from "@/page/trading/xs/sections/orderbook";
import { TabPane, Tabs } from "@/tab";
import { FC, useState } from "react";
import { MemorizedTradeHistoryFull, TradeHistoryFull } from "./tradingHistory";
import { ScrollArea } from "@/scrollArea";
import { MemorizedScrollPane } from "@/scrollArea/pane";

interface Props {
  symbol: string;
}

export const MyOrderBookAndTrade: FC<Props> = (props) => {
  const [value, setValue] = useState("orderbook");

  return (
    <Tabs
      value={value}
      onTabChange={(value) => setValue(value)}
      allowUngroup
      fullWidth
      keepAlive
      minWidth={280}
      tabBarClassName="orderly-h-[48px] orderly-text-sm"
    >
      <TabPane title="Orderbook" value="orderbook">
        <div className="orderly-px-3">
          <MemorizedOrderBook symbol={props.symbol} />
        </div>
      </TabPane>
      <TabPane title="Last trades" value="tradeHistory">
        <MemorizedTradeHistoryFull symbol={props.symbol} />
      </TabPane>
    </Tabs>
  );
};
