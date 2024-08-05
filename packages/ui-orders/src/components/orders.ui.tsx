import { DataTable, TabPanel, Tabs } from "@orderly.network/ui";
import { useOrderColumn } from "./orderList/useColumn";
import { OrderStatus, API } from "@orderly.network/types";
import { OrdersBuilderState } from "./orders.script";
import { TabType } from "./orders.widget";
import { OrderList, OrderListWidget } from "./orderList";

export const Orders = (
  props: OrdersBuilderState
) => {

  return (
    <Tabs defaultValue={props.current || TabType.all}>
      <TabPanel value={TabType.all} title="All">
        <OrderListWidget ordersStatus={OrderStatus.INCOMPLETE} />
      </TabPanel>
      <TabPanel value={TabType.pending} title="Pending">
        <div></div>
      </TabPanel>
      <TabPanel value={TabType.tp_sl} title="TP/SL">
        <div></div>
      </TabPanel>
      <TabPanel value={TabType.filled} title="Filled">
        <div></div>
      </TabPanel>
      <TabPanel value={TabType.cancelled} title="Cancelled">
        <div></div>
      </TabPanel>
      <TabPanel value={TabType.rejected} title="Rejected">
        <div></div>
      </TabPanel>
      <TabPanel value={TabType.orderHistory} title="Order history">
        <div></div>
      </TabPanel>
    </Tabs>
  );
};
// ----------------- Orders ui component end -----------------

type OrderTableProps = {
  status: OrderStatus;
  dataSource: API.OrderExt[] | null;
  isLoading?: boolean;
};

// ----------------- OrderTable start -----------------
const OrderTable = (props: OrderTableProps) => {
  const colums = useOrderColumn(props.status);

  return (
    <DataTable
      columns={colums}
      dataSource={props.dataSource}
      loading={props.isLoading}
    />
  );
};
// ----------------- OrderTable end -----------------
