import React, { useContext } from "react";
import { TabPane, Tabs } from "@/tab";
import { TradeHistoryPane } from "./tradeHistory";
import { FC, useState } from "react";
import { TradeData } from "./tradeData";
import { TradingView, TradingViewChartConfig } from "@/block/tradingView";
import { ChevronDown } from "lucide-react";
import { OrderlyContext } from "@orderly.network/hooks";

interface ChartViewProps {
  symbol: string;
  tradingViewConfig: TradingViewChartConfig;
}

export const ChartView: FC<ChartViewProps> = (props) => {
  const { symbol, tradingViewConfig } = props;
  const [activeTab, setActiveTab] = useState("tradingView");
  const { klineDataUrl } = useContext(OrderlyContext);

  console.log("klineDataUrl", klineDataUrl, symbol);

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
            apiBaseUrl={klineDataUrl}
            {...tradingViewConfig}
          />
        </TabPane>
        <TabPane title="Trade" value="tradeHistory">
          <TradeHistoryPane symbol={symbol} />
        </TabPane>
        <TabPane title="Data" value="tradeData">
          <TradeData symbol={symbol} />
        </TabPane>
      </Tabs>
    </div>
  );
};
