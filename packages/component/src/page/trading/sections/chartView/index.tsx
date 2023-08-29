import React from "react";
import { TabPane, Tabs } from "@/tab";
import { TradeHistory } from "./tradeHistory";
import { FC, useState } from "react";
import { TradeData } from "./tradeData";
import { TradingView, TradingViewChartConfig } from "@/block/tradingView";
import { ChevronDown } from "lucide-react";

interface ChartViewProps {
  symbol: string;
  tradingViewConfig: TradingViewChartConfig;
}

export const ChartView: FC<ChartViewProps> = (props) => {
  const { symbol, tradingViewConfig } = props;
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
            height={258}
            theme={"dark"}
            symbol={symbol}
            autosize={false}
            {...tradingViewConfig}
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
