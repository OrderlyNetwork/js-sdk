import { FC } from "react";
import { NavBar } from "./sections/navbar";
import { DataListView } from "./sections/dataList";
import { ChartView } from "./sections/chartView";
import { MyOrderBook } from "./sections/orderbook";
import { MyOrderEntry } from "./sections/orderEntry";
import { AccountStatusBar } from "@/block/accountStatus";
import { Divider } from "@/divider";

interface TradingPageProps {
  symbol: string;
}

export const TradingPage: FC<TradingPageProps> = (props) => {
  return (
    <>
      <NavBar symbol={props.symbol} />
      <Divider />
      <ChartView />

      <div className="grid grid-cols-[3fr_4fr] box-border p-2">
        <MyOrderBook />
        <MyOrderEntry />
      </div>
      <DataListView />
      <div className="fixed left-0 bottom-0 w-screen bg-base-200 p-2 border-t border-base-300 z-30">
        <AccountStatusBar chains={[]} status={"NotConnected"} />
      </div>
    </>
  );
};
