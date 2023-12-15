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
        <SymbolProvider symbol={props.symbol}>
          <MemorizedOrderBook
            symbol={props.symbol}
            className={"orderly-px-3"}
          />
        </SymbolProvider>
      </TabPane>
      <TabPane title="Last trades" value="tradeHistory">
        <SymbolProvider symbol={props.symbol}>
          <MemorizedTradeHistoryFull symbol={props.symbol} />
        </SymbolProvider>
      </TabPane>
    </Tabs>
  );
};
