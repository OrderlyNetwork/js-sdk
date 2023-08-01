import { OrderEntry } from "@/block/orderEntry";
import { NavBar } from "./sections/navbar";
import { DataListView } from "./sections/dataList";
import { ChartView } from "./sections/chartView";
import { OrderBook } from "@/block/orderbook";
import { MyOrderBook } from "./sections/orderbook";
import { MyOrderEntry } from "./sections/orderEntry";

export const TradingPage = () => {
  return (
    <>
      <NavBar />
      <ChartView />

      <div className="grid grid-cols-[180px_1fr] box-border p-2">
        <MyOrderBook />

        <MyOrderEntry />
      </div>
      <DataListView />
      <div className="bg-slate-200 fixed left-0 right-0 bottom-0">
        bottom bar
      </div>
    </>
  );
};
