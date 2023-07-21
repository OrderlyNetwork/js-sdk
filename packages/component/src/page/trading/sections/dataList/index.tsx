import { TabPane, Tabs } from "@/tab";
import { useState } from "react";

export const DataListView = () => {
  const [activeTab, setActiveTab] = useState("positions");
  return (
    <Tabs value={activeTab} onTabChange={setActiveTab}>
      <TabPane title="Positions(2)" value="positions">
        Positions
      </TabPane>
      <TabPane title="Orders" value="orders">
        Orders
      </TabPane>
    </Tabs>
  );
};
