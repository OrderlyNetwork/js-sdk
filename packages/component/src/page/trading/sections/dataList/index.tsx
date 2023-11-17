import { TabContextState, TabPane, Tabs } from "@/tab";
import React, { useCallback, useContext, useMemo, useState } from "react";
import { PositionPane } from "./position";
import { OrdersPane } from "@/page/trading/sections/dataList/orders";
import { HistoryPane } from "./history";
import { PositionTabTitle } from "./position/tabTitle";
import { OrdersTabTitle } from "./orders/tabTitle";

export const DataListView = () => {
  const [activeTab, setActiveTab] = useState("positions");

  return (
    <Tabs
      value={activeTab}
      onTabChange={setActiveTab}
      tabBarClassName="orderly-bg-base-700 orderly-text-3xs"
    >
      <TabPane title={<PositionTabTitle />} value="positions">
        <PositionPane />
      </TabPane>
      <TabPane title={<OrdersTabTitle />} value="orders">
        <OrdersPane />
      </TabPane>
      <TabPane title="History" value="history">
        <HistoryPane />
      </TabPane>
    </Tabs>
  );
};
