import { TabPane, Tabs } from "@/tab";
import { useState } from "react";
import { PositionPane } from "./position";

export const DataListView = () => {
  const [activeTab, setActiveTab] = useState("positions");
  return (
    <Tabs value={activeTab} onTabChange={setActiveTab}>
      <TabPane title="Positions(2)" value="positions">
        <PositionPane />
      </TabPane>
      <TabPane title="Orders" value="orders">
        Orders
      </TabPane>
    </Tabs>
  );
};
