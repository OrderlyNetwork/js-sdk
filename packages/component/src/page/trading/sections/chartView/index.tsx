import { TabPane, Tabs } from "@/tab";
import { TradeHistory } from "./tradeHistory";
import { useState } from "react";
import { TradeData } from "./tradeData";
import { TradingView } from "@/block/tradingView";
import { ChevronDown } from "lucide-react";

export const ChartView = () => {
  const [activeTab, setActiveTab] = useState("tradingView");

  return (
    <div>
      <Tabs
        showIdentifier={false}
        value={activeTab}
        onTabChange={setActiveTab}
        tabBarExtra={(context) => {
          return (
            <div className="flex items-center">
              <button
                className={"px-5"}
                onClick={() => {
                  context.toggleContentVisible();
                }}
              >
                <ChevronDown size={16} />
              </button>
            </div>
          );
        }}
      >
        <TabPane title="Chart" value="tradingView">
          <TradingView
            height={320}
            theme={"dark"}
            // intervals={}
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
