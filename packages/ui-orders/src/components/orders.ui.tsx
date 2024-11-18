import { TabPanel, Tabs } from "@orderly.network/ui";
import { OrderStatus, API } from "@orderly.network/types";
import { OrdersBuilderState } from "./orders.script";
import { TabType } from "./orders.widget";
import { DesktopOrderListWidget } from "./orderList";

export const Orders = (props: OrdersBuilderState) => {
  return (
    <Tabs
      defaultValue={props.current || TabType.all}
      variant="contained"
      className="oui-h-full"
      classNames={{
        tabsContent: "oui-h-[calc(100%_-_28px)]",
      }}
    >
      <TabPanel value={TabType.all} title="All">
        <DesktopOrderListWidget type={TabType.all} />
      </TabPanel>
      <TabPanel value={TabType.pending} title="Pending">
        <DesktopOrderListWidget
          type={TabType.pending}
          ordersStatus={OrderStatus.INCOMPLETE}
        />
      </TabPanel>
      <TabPanel value={TabType.tp_sl} title="TP/SL">
        <DesktopOrderListWidget
          type={TabType.tp_sl}
          ordersStatus={OrderStatus.INCOMPLETE}
        />
      </TabPanel>
      <TabPanel value={TabType.filled} title="Filled">
        <DesktopOrderListWidget
          type={TabType.filled}
          ordersStatus={OrderStatus.FILLED}
        />
      </TabPanel>
      <TabPanel value={TabType.cancelled} title="Cancelled">
        <DesktopOrderListWidget
          type={TabType.cancelled}
          ordersStatus={OrderStatus.CANCELLED}
        />
      </TabPanel>
      <TabPanel value={TabType.rejected} title="Rejected">
        <DesktopOrderListWidget
          type={TabType.rejected}
          ordersStatus={OrderStatus.REJECTED}
        />
      </TabPanel>
      {/* <TabPanel value={TabType.orderHistory} title="Order history">
        <DesktopOrderListWidget
          type={TabType.orderHistory}
        />
      </TabPanel> */}
    </Tabs>
  );
};
// ----------------- Orders ui component end -----------------
