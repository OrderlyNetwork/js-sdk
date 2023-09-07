import React, { type FC } from "react";
import { NavBar } from "./sections/navbar";
import { DataListView } from "./sections/dataList";
import { ChartView } from "./sections/chartView";
import { MyOrderBook } from "./sections/orderbook";
import { MyOrderEntry } from "./sections/orderEntry";
import { Divider } from "@/divider";
import { MyLeverageView } from "./sections/leverage";
import { TradingPageProvider } from "./context/tradingPageContext";
import { TradingViewChartConfig } from "@/block/tradingView";
import { BottomNavBar } from "./sections/bottombar";
import { Page } from "@/layout";
import { API } from "@orderly.network/types";
import { AssetsProvider } from "@/provider/assetsProvider";

interface TradingPageProps {
  symbol: string;
  tradingViewConfig: TradingViewChartConfig;
  onSymbolChange?: (symbol: API.Symbol) => void;
}

export const TradingPage: FC<TradingPageProps> = (props) => {
  return (
    <TradingPageProvider
      symbol={props.symbol}
      onSymbolChange={props.onSymbolChange}
    >
      <AssetsProvider>
        <div className="pb-[70px]">
          <NavBar symbol={props.symbol} />
          <Divider />
          <ChartView
            symbol={props.symbol}
            tradingViewConfig={props.tradingViewConfig}
          />
          <MyLeverageView symbol={props.symbol} />
          <div className="grid grid-cols-[3fr_4fr] box-border p-2">
            <MyOrderBook symbol={props.symbol} />
            <MyOrderEntry symbol={props.symbol} />
          </div>
          <DataListView />
          <BottomNavBar />
        </div>
      </AssetsProvider>
    </TradingPageProvider>
  );
};
