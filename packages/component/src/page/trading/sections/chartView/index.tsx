import { TabPane, Tabs } from "@/tab";
import { TradeHistory } from "./tradeHistory";
import { useState } from "react";
import { TradeData } from "./tradeData";
import { TradingView } from "@/block/tradingView";

export const ChartView = () => {
  const [activeTab, setActiveTab] = useState("tradingView");

  return (
    <div className="bg-slate-100">
      <Tabs
        value={activeTab}
        onTabChange={setActiveTab}
        tabBarExtra={(context) => {
          return (
            <div className="flex items-center">
              <button
                onClick={() => {
                  context.toggleContentVisible();
                }}
              >
                Toggle
              </button>
            </div>
          );
        }}
      >
        <TabPane title="Chart" value="tradingView">
          <TradingView
            height={320}
            intervals={[
              "1",
              "3",
              "5",
              "15",
              "30",
              "60",
              "240",
              "720",
              "1D",
              "1W",
            ]}
          />
        </TabPane>
        <TabPane title="Trade" value="tradeHistory">
          <TradeHistory />
        </TabPane>
        <TabPane title="Data" value="tradeData">
          <TradeData />
        </TabPane>
      </Tabs>
    </div>
  );
};
