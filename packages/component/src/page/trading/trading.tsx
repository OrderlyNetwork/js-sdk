import { OrderEntry } from "@/block/orderEntry";
import { NavBar } from "./sections/navbar";
import { DataListView } from "./sections/dataList";
import { ChartView } from "./sections/chartView";

export const TradingPage = () => {
  return (
    <>
      <NavBar />

      <div>Chart View Tabbar</div>
      <div>Time interval</div>
      <ChartView />
      <div className="flex flex-row gap-3 h-[300px] px-3 box-border">
        <div className="bg-red-100 w-[150px]">Orderbook</div>
        <div className="bg-yellow-200 flex-1">
          <OrderEntry />
        </div>
      </div>
      <DataListView />
      <div className="bg-slate-200 fixed left-0 right-0 bottom-0">
        bottom bar
      </div>
    </>
  );
};
