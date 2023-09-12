import React, { useContext } from "react";
import { TabPane, Tabs } from "@/tab";
import { TradeHistoryPane } from "./tradeHistory";
import { FC, useState } from "react";
import { TradeData } from "./tradeData";
import { TradingView, TradingViewChartConfig } from "@/block/tradingView";
import { ChevronDown } from "lucide-react";
import { OrderlyContext } from "@orderly.network/hooks";
import { SymbolProvider } from "@/provider";
import { cn } from "@/utils/css";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/tabs";

interface ChartViewProps {
  symbol: string;
  tradingViewConfig: TradingViewChartConfig;
}

export const ChartView: FC<ChartViewProps> = (props) => {
  const { symbol, tradingViewConfig } = props;
  const [activeTab, setActiveTab] = useState("tradingView");
  const { klineDataUrl } = useContext(OrderlyContext);

  // return (
  //   <Tabs defaultValue="account">
  //     <TabsList>
  //       <TabsTrigger value="tradingView">TradingView</TabsTrigger>
  //       <TabsTrigger value="tradeHistory">Trade</TabsTrigger>
  //       <TabsTrigger value="tradeData">tradeData</TabsTrigger>
  //     </TabsList>
  //     <TabsContent forceMount value="tradingView">
  //       <TradingView
  //         height={240}
  //         theme={"dark"}
  //         symbol={symbol}
  //         autosize={false}
  //         apiBaseUrl={klineDataUrl}
  //         {...tradingViewConfig}
  //       />
  //     </TabsContent>
  //     <TabsContent forceMount value="tradeHistory">
  //       <TradeHistoryPane symbol={symbol} />
  //     </TabsContent>
  //     <TabsContent forceMount value="tradeData">
  //       <TradeData symbol={symbol} />
  //     </TabsContent>
  //   </Tabs>
  // );

  return (
    <div>
      <Tabs
        showIdentifier={false}
        value={activeTab}
        onTabChange={setActiveTab}
        tabBarClassName="h-[40px]"
        tabBarExtra={(context) => {
          return (
            <div className="flex items-center">
              <button
                className={"px-5"}
                onClick={() => {
                  context.toggleContentVisible();
                }}
              >
                <ChevronDown
                  size={18}
                  className={cn(
                    "transition-transform text-base-contrast/50",
                    context.contentVisible ? "rotate-0" : "rotate-180"
                  )}
                />
              </button>
            </div>
          );
        }}
      >
        <TabPane title="Chart" value="tradingView">
          <TradingView
            height={240}
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
          <SymbolProvider symbol={symbol}>
            <TradeData symbol={symbol} />
          </SymbolProvider>
        </TabPane>
      </Tabs>
    </div>
  );
};
