import { TabPane, Tabs } from "@/tab";
import { useState } from "react";
import { PositionPane } from "./position";
import { OrdersPane } from "@/page/trading/sections/dataList/orders";
import { HistoryPane } from "./history";

export const DataListView = () => {
  const [activeTab, setActiveTab] = useState("positions");
  return (
    <Tabs value={activeTab} onTabChange={setActiveTab}>
      <TabPane title="Positions(2)" value="positions">
        <PositionPane />
      </TabPane>
      <TabPane title="Pending(2)" value="orders">
        <OrdersPane />
      </TabPane>
      <TabPane title="History" value="history">
        <HistoryPane />
      </TabPane>
    </Tabs>
  );
};
