import { TabPane, Tabs } from "@/tab";
import { TradingView } from "./tradingView";
import { TradeHistory } from "./tradeHistory";
import { useState } from "react";
import { TradeData } from "./tradeData";

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
          <TradingView />
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
