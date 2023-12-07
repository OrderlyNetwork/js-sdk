import { TabPane, Tabs } from "@/tab";
import { memo, useState } from "react";
import { PositionPane } from "./positions";
import { MyOrders } from "./orders";
import { OrderStatus } from "@orderly.network/types";

export const DataListView = () => {
  const [activeTab, setActiveTab] = useState("positions");

  return (
    <Tabs
      value={activeTab}
      onTabChange={setActiveTab}
      tabBarClassName="orderly-h-[48px] orderly-text-sm"
    >
      <TabPane title={"Portfolio"} value="positions" className="orderly-px-3">
        <PositionPane />
        {/* <div>Positions</div> */}
      </TabPane>
      <TabPane title={"pending"} value="orders" className="orderly-px-3">
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
        {/* <HistoryPane /> */}
        <div>History</div>
      </TabPane>
      <TabPane title="Order History" value="history" className="orderly-px-3">
        {/* <HistoryPane /> */}
        <div>History</div>
      </TabPane>
    </Tabs>
  );
};

export const MemoizedDataListView = memo(DataListView);
