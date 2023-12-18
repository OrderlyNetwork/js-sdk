import { TabPane, Tabs } from "@/tab";
import { memo, useState } from "react";
import { PositionPane } from "./positions";
import { MyOrders } from "./orders";
import { OrderStatus } from "@orderly.network/types";
import { MemoizedOrdersTabTitle } from "@/page/trading/xs/sections/dataList/orders/tabTitle";
import { Checkbox } from "@/checkbox";
import { Label } from "@/label";
import { TabBarExtraNode } from "@/page/trading/fill/sections/datalist/tabbarExtraNode";
import { HistoryView } from "./history";

export const DataListView = () => {
  const [activeTab, setActiveTab] = useState("positions");

  return (
    <Tabs
      autoFit
      value={activeTab}
      onTabChange={setActiveTab}
      tabBarClassName="orderly-h-[48px] orderly-text-sm desktop:orderly-font-semibold"
      tabBarExtra={<TabBarExtraNode />}
      extraData={{
        showAllSymbol: false,
      }}
    >
      <TabPane title={"Portfolio"} value="positions" className="orderly-px-3">
        <PositionPane />
        {/* <div>Positions</div> */}
      </TabPane>
      <TabPane
        title={<MemoizedOrdersTabTitle />}
        value="orders"
        className="orderly-px-3"
      >
        {/* <OrdersPane /> */}
        <MyOrders status={OrderStatus.INCOMPLETE} />
      </TabPane>
      <TabPane title="Filled" value="filled" className="orderly-px-3">
        {/* <HistoryPane /> */}
        <MyOrders status={OrderStatus.FILLED} />
      </TabPane>
      <TabPane title="Cancelled" value="cancelled" className="orderly-px-3">
        {/* <HistoryPane /> */}
        <MyOrders status={OrderStatus.CANCELLED} />
      </TabPane>
      <TabPane title="Rejected" value="rejected" className="orderly-px-3">
        <MyOrders status={OrderStatus.REJECTED} />
      </TabPane>
      <TabPane title="Order History" value="history" className="orderly-px-3">
        <HistoryView />
      </TabPane>
    </Tabs>
  );
};

export const MemoizedDataListView = memo(DataListView);
