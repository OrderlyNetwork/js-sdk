import React, { type FC } from "react";
import { NavBar } from "./sections/navbar";
import { DataListView } from "./sections/dataList";
import { ChartView } from "./sections/chartView";
import { MyOrderBook } from "./sections/orderbook";
import { MyOrderEntry } from "./sections/orderEntry";
import { Divider } from "@/divider";
import { MemoizedCompnent } from "./sections/leverage";
import { TradingPageProvider } from "../context/tradingPageContext";
import { TradingViewChartConfig } from "@/block/tradingView";
import { BottomNavBar } from "./sections/bottombar";
import { Page } from "@/layout";
import { API } from "@orderly.network/types";
import { AssetsProvider } from "@/provider/assetsProvider";
import { useExecutionReport } from "../hooks/useExecutionReport";
import { TradingPageProps } from "../types";

// interface TradingPageProps {
//   symbol: string;
//   tradingViewConfig: TradingViewChartConfig;
//   onSymbolChange?: (symbol: API.Symbol) => void;
// }

export const TradingPage: FC<TradingPageProps> = (props) => {
  useExecutionReport();
  return (
    <div className="orderly-pb-[70px]">
      <NavBar symbol={props.symbol} />
      {/* <Divider /> */}
      <ChartView
        symbol={props.symbol}
        tradingViewConfig={props.tradingViewConfig}
      />
      <MemoizedCompnent symbol={props.symbol} />
      <div className="orderly-grid orderly-grid-cols-[3fr_4fr] orderly-box-border orderly-p-2 orderly-items-start">
        <div className="orderly-w-full">
          <MyOrderBook symbol={props.symbol} />
        </div>
        <AssetsProvider>
          <MyOrderEntry symbol={props.symbol} />
        </AssetsProvider>
      </div>
      <DataListView />
      <AssetsProvider>
        <BottomNavBar />
      </AssetsProvider>
    </div>
  );
};
