import { TabPane, Tabs } from "@/tab";
import { useState } from "react";
import { PositionPane } from "./positions";

export const DataListView = () => {
  const [activeTab, setActiveTab] = useState("positions");

  return (
    <Tabs value={activeTab} onTabChange={setActiveTab} tabBarClassName="">
      <TabPane title={"Portfolio"} value="positions" className="orderly-px-3">
        <PositionPane />
        {/* <div>Positions</div> */}
      </TabPane>
      <TabPane title={"pending"} value="orders" className="orderly-px-3">
        {/* <OrdersPane /> */}
        <div>Orders</div>
      </TabPane>
      <TabPane title="History" value="history" className="orderly-px-3">
        {/* <HistoryPane /> */}
        <div>History</div>
      </TabPane>
    </Tabs>
  );
};
