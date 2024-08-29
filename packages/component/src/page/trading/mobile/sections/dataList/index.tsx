import { TabContextState, TabPane, Tabs } from "@/tab";
import React, { useCallback, useContext, useMemo, useState } from "react";
import { PositionPane } from "./position";
import { OrdersPane } from "@/page/trading/mobile/sections/dataList/orders";
import { HistoryPane } from "./history";
import { PositionTabTitle } from "./position/tabTitle";
import { MemoizedOrdersTabTitle } from "./orders/tabTitle";
import { TPSLTabTitle } from "@/page/trading/desktop/sections/datalist/tpslTabTitle";
import { AlgoOrderRootType } from "@orderly.network/types";

export const DataListView = () => {
  const [activeTab, setActiveTab] = useState("positions");

  return (
    <Tabs
      id="orderly-data-list"
      value={activeTab}
      onTabChange={setActiveTab}
      tabBarClassName="orderly-data-list-tab-bar orderly-bg-base-900 orderly-text-xs"
    >
      <TabPane
        title={<PositionTabTitle />}
        value="positions"
        id="orderly-data-list-positions"
      >
        <PositionPane />
      </TabPane>
      <TabPane
        title={<MemoizedOrdersTabTitle />}
        value="orders"
        id="orderly-data-list-pending"
      >
        <OrdersPane
          excludes={[
            AlgoOrderRootType.POSITIONAL_TP_SL,
            AlgoOrderRootType.TP_SL,
          ]}
        />
      </TabPane>
      <TabPane
        title={<TPSLTabTitle />}
        value="tpsl"
        id="orderly-tpsl-list-pending"
      >
        <OrdersPane
          includes={[
            AlgoOrderRootType.POSITIONAL_TP_SL,
            AlgoOrderRootType.TP_SL,
          ]}
        />
      </TabPane>
      <TabPane title="History" value="history" id="orderly-data-list-history">
        <HistoryPane />
      </TabPane>
    </Tabs>
  );
};
