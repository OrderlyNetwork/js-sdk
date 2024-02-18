import { type FC } from "react";
import { NavBar } from "./sections/navbar";
import { DataListView } from "./sections/dataList";
import { ChartView } from "./sections/chartView";
import { MyOrderBook } from "./sections/orderbook";
import { MyOrderEntry } from "./sections/orderEntry";
import { MemoizedCompnent } from "./sections/leverage";
import { BottomNavBar } from "./sections/bottombar";
import { AssetsProvider } from "@/provider/assetsProvider";
import { TradingPageProps } from "../types";

interface MobileTradingPageProps extends TradingPageProps {}

export const MobileTradingPage: FC<MobileTradingPageProps> = (props) => {
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
