import { TabPane, Tabs } from "@/tab";
import { FC, useState } from "react";
import { MemorizedTradeHistoryFull } from "./tradingHistory";
import { MemorizedOrderBook } from "./orderbook";
import { SymbolProvider } from "@/provider/symbolProvider";

interface Props {
  symbol: string;
}

export const MyOrderBookAndTrade: FC<Props> = (props) => {
  const [value, setValue] = useState("orderbook");

  return (
    <SymbolProvider symbol={props.symbol}>
      <Tabs
        value={value}
        onTabChange={(value) => setValue(value)}
        allowUngroup
        fullWidth
        keepAlive
        autoFit
        minWidth={280}
        tabBarClassName="orderly-h-[48px] orderly-text-sm"
      >
        <TabPane title="Orderbook" value="orderbook">
          <MemorizedOrderBook
            symbol={props.symbol}
            className={"orderly-px-3"}
          />
        </TabPane>
        <TabPane title="Last trades" value="tradeHistory">
          <MemorizedTradeHistoryFull symbol={props.symbol} />
        </TabPane>
      </Tabs>
    </SymbolProvider>

  );
};
