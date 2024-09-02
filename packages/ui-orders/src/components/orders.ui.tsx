import { DataTable, TabPanel, Tabs } from "@orderly.network/ui";
import { useOrderColumn } from "./orderList/useColumn";
import { OrderStatus, API } from "@orderly.network/types";
import { OrdersBuilderState } from "./orders.script";
import { TabType } from "./orders.widget";
import { OrderList, OrderListWidget } from "./orderList";

export const Orders = (props: OrdersBuilderState) => {
  return (
    <Tabs defaultValue={props.current || TabType.all} variant="contained">
      <TabPanel value={TabType.all} title="All">
        <OrderListWidget
          type={TabType.all}
        />
      </TabPanel>
      <TabPanel value={TabType.pending} title="Pending">
        <OrderListWidget
          type={TabType.pending}
          ordersStatus={OrderStatus.INCOMPLETE}
        />
      </TabPanel>
      <TabPanel value={TabType.tp_sl} title="TP/SL">
        <OrderListWidget
          type={TabType.tp_sl}
          ordersStatus={OrderStatus.INCOMPLETE}
        />
      </TabPanel>
      <TabPanel value={TabType.filled} title="Filled">
        <OrderListWidget
          type={TabType.filled}
          ordersStatus={OrderStatus.FILLED}
        />
      </TabPanel>
      <TabPanel value={TabType.cancelled} title="Cancelled">
        <OrderListWidget
          type={TabType.cancelled}
          ordersStatus={OrderStatus.CANCELLED}
        />
      </TabPanel>
      <TabPanel value={TabType.rejected} title="Rejected">
        <OrderListWidget
          type={TabType.rejected}
          ordersStatus={OrderStatus.REJECTED}
        />
      </TabPanel>
      <TabPanel value={TabType.orderHistory} title="Order history">
        <OrderListWidget
          type={TabType.orderHistory}
        />
      </TabPanel>
    </Tabs>
  );
};
// ----------------- Orders ui component end -----------------
