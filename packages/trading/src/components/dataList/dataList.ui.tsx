import { FC } from "react";
import { Flex, TabPanel, Tabs, Text } from "@orderly.network/ui";
import { DataListState, DataListTabType } from "./dataList.script";
import { PositionsWidget } from "@orderly.network/ui-positions";
import { OrderListWidget, TabType } from "@orderly.network/ui-orders";
import { OrderStatus } from "@orderly.network/types";

export const DataList: FC<DataListState> = (props) => {
  return (
    <Tabs
      defaultValue={props.current || DataListTabType.positions}
      variant="contained"
    >
      <TabPanel
        value={DataListTabType.positions}
        title={DataListTabType.positions}
      >
        <PositionsWidget />
      </TabPanel>
      <TabPanel value={DataListTabType.pending} title={DataListTabType.pending}>
        <OrderListWidget
          type={TabType.pending}
          ordersStatus={OrderStatus.INCOMPLETE}
        />
      </TabPanel>
      <TabPanel value={DataListTabType.tp_sl} title={DataListTabType.tp_sl}>
        <OrderListWidget
          type={TabType.tp_sl}
          ordersStatus={OrderStatus.INCOMPLETE}
        />
      </TabPanel>
      <TabPanel value={DataListTabType.filled} title={DataListTabType.filled}>
        <OrderListWidget
          type={TabType.filled}
          ordersStatus={OrderStatus.FILLED}
        />
      </TabPanel>
      <TabPanel
        value={DataListTabType.orderHistory}
        title={DataListTabType.orderHistory}
      >
        <OrderListWidget type={TabType.orderHistory} />
      </TabPanel>
    </Tabs>
  );
};
