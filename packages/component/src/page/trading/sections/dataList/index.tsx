import { TabContextState, TabPane, Tabs } from "@/tab";
import React, { useCallback, useContext, useMemo, useState } from "react";
import { PositionPane } from "./position";
import { OrdersPane } from "@/page/trading/sections/dataList/orders";
import { HistoryPane } from "./history";
import { TradingPageContext } from "../../context/tradingPageContext";

export const DataListView = () => {
  const [activeTab, setActiveTab] = useState("positions");
  const { positionCount, pendingCount } = useContext(TradingPageContext);
  // const { data } = useContext(TabContext);

  const positionTabTitle = useMemo(() => {
    return `Positions${
      positionCount && positionCount > 0 ? `(${positionCount})` : ""
    }`;
  }, [positionCount]);

  const orderTabTitle = useMemo(() => {
    return `Pending${
      pendingCount && pendingCount > 0 ? `(${pendingCount})` : ""
    }`;
  }, [pendingCount]);

  return (
    <Tabs
      value={activeTab}
      onTabChange={setActiveTab}
      tabBarClassName="bg-base-200"
    >
      <TabPane title={positionTabTitle} value="positions">
        <PositionPane />
      </TabPane>
      <TabPane title={orderTabTitle} value="orders">
        <OrdersPane />
      </TabPane>
      <TabPane title="History" value="history">
        <HistoryPane />
      </TabPane>
    </Tabs>
  );
};
