import { TabPanel, Tabs } from "@orderly.network/ui";
import { OrderStatus, API } from "@orderly.network/types";
import { OrdersBuilderState } from "./orders.script";
import { TabType } from "./orders.widget";
import { DesktopOrderListWidget } from "./orderList";
import { DesktopOrderListWidgetProps } from "./orderList/orderList.widget";

export const Orders = (props: OrdersBuilderState) => {
  const commonProps: Partial<DesktopOrderListWidgetProps> = {
    pnlNotionalDecimalPrecision: props.pnlNotionalDecimalPrecision,
  };

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
        <DesktopOrderListWidget
          ref={props.orderListRef}
          type={TabType.all}
          pnlNotionalDecimalPrecision={props.pnlNotionalDecimalPrecision}
          sharePnLConfig={props.sharePnLConfig}
          {...commonProps}
        />
      </TabPanel>
      <TabPanel value={TabType.pending} title="Pending">
        <DesktopOrderListWidget
          ref={props.orderListRef}
          type={TabType.pending}
          ordersStatus={OrderStatus.INCOMPLETE}
          {...commonProps}
        />
      </TabPanel>
      <TabPanel value={TabType.tp_sl} title="TP/SL">
        <DesktopOrderListWidget
          ref={props.orderListRef}
          type={TabType.tp_sl}
          ordersStatus={OrderStatus.INCOMPLETE}
          {...commonProps}
        />
      </TabPanel>
      <TabPanel value={TabType.filled} title="Filled">
        <DesktopOrderListWidget
          ref={props.orderListRef}
          type={TabType.filled}
          ordersStatus={OrderStatus.FILLED}
          pnlNotionalDecimalPrecision={props.pnlNotionalDecimalPrecision}
          sharePnLConfig={props.sharePnLConfig}
          {...commonProps}
        />
      </TabPanel>
      <TabPanel value={TabType.cancelled} title="Cancelled">
        <DesktopOrderListWidget
          ref={props.orderListRef}
          type={TabType.cancelled}
          ordersStatus={OrderStatus.CANCELLED}
          {...commonProps}
        />
      </TabPanel>
      <TabPanel value={TabType.rejected} title="Rejected">
        <DesktopOrderListWidget
          ref={props.orderListRef}
          type={TabType.rejected}
          ordersStatus={OrderStatus.REJECTED}
          {...commonProps}
        />
      </TabPanel>
      {/* <TabPanel value={TabType.orderHistory} title="Order history">
        <DesktopOrderListWidget
          type={TabType.orderHistory}
          {...commonProps}
        />
      </TabPanel> */}
    </Tabs>
  );
};
// ----------------- Orders ui component end -----------------
