import React, { useContext } from "react";
import { TabPane, Tabs } from "@/tab";
import { TradeHistoryPane } from "./tradeHistory";
import { FC, useState } from "react";
import { TradeData } from "./tradeData";
import { ChevronDown } from "lucide-react";
import {
  OrderlyContext,
  useLocalStorage,
  useConfig,
} from "@orderly.network/hooks";
import { SymbolProvider } from "@/provider";
import { cn } from "@/utils/css";
import MyTradingView from "@/page/trading/mobile/sections/chartView/myTradingView";
import { TradingPageProps } from "@/page/trading/types";

export const ChartView: FC<TradingPageProps> = (props) => {
  const { symbol, tradingViewConfig } = props;
  const [activeTab, setActiveTab] = useState("tradingView");
  const apiBaseUrl = useConfig("apiBaseUrl");
  const [collapsed, setCollapsed] = useLocalStorage(
    "orderly:chart:collapsed",
    true
  );

  return (
    <div id="orderly-chart-view-tabs" className="orderly-text-3xs">
      <Tabs
        showIdentifier={false}
        value={activeTab}
        onTabChange={setActiveTab}
        tabBarClassName="orderly-h-[40px]"
        collapsed={collapsed}
        // @ts-ignore
        onToggleCollapsed={() => setCollapsed((prev: boolean) => !prev)}
        tabBarExtra={(context) => {
          return (
            <div className="orderly-flex orderly-items-center">
              <button
                className="orderly-px-5"
                onClick={() => {
                  context.toggleContentVisible();
                }}
              >
                {/* @ts-ignore */}
                <ChevronDown
                  size={18}
                  className={cn(
                    "orderly-transition-transform orderly-text-base-contrast/50",
                    context.contentVisible
                      ? "orderly-rotate-180"
                      : "orderly-rotate-0"
                  )}
                />
              </button>
            </div>
          );
        }}
      >
        <TabPane title="Chart" value="tradingView">
          <MyTradingView
            symbol={symbol}
            tradingViewConfig={tradingViewConfig}
          />
        </TabPane>
        <TabPane title="Trade" value="tradeHistory">
          <div className="orderly-h-[240px] orderly-overflow-y-auto">
            <SymbolProvider symbol={symbol}>
              <div className="orderly-px-[16px]">
                <TradeHistoryPane symbol={symbol} />
              </div>
            </SymbolProvider>
          </div>
        </TabPane>
        <TabPane title="Data" value="tradeData">
          <SymbolProvider symbol={symbol}>
            <TradeData symbol={symbol} />
          </SymbolProvider>
        </TabPane>
      </Tabs>
    </div>
  );
};
