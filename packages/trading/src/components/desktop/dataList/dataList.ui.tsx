import { FC } from "react";
import { Divider, Flex, TabPanel, Tabs, Text } from "@orderly.network/ui";
import { DataListState, DataListTabType } from "./dataList.script";
import { PositionsWidget } from "@orderly.network/ui-positions";
import { OrderListWidget, TabType } from "@orderly.network/ui-orders";
import { OrderStatus } from "@orderly.network/types";
import { PositionHeaderWidget } from "../../base/positionHeader";
import { SettingWidget } from "./setting";

export const DataList: FC<DataListState> = (props) => {
  return (
    <Tabs
      defaultValue={props.current || DataListTabType.positions}
      variant="contained"
      trailing={
        <SettingWidget
          pnlNotionalDecimalPrecision={props.pnlNotionalDecimalPrecision}
          setPnlNotionalDecimalPrecision={props.setPnlNotionalDecimalPrecision}
          unPnlPriceBasis={props.unPnlPriceBasis}
          setUnPnlPriceBasic={props.setUnPnlPriceBasic}
          showAllSymbol={props.showAllSymbol}
          setShowAllSymbol={props.setShowAllSymbol}
        />
      }
    >
      <TabPanel
        value={DataListTabType.positions}
        title={DataListTabType.positions}
      >
        <PositionsView {...props} />
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

const PositionsView: FC<DataListState> = (props) => {
  return (
    <Flex direction={"column"}>
      <PositionHeaderWidget
        pnlNotionalDecimalPrecision={props.pnlNotionalDecimalPrecision}
        symbol={props.config?.symbol}
        unPnlPriceBasis={props.unPnlPriceBasis}
      />
      <Divider className="oui-w-full" />
      <PositionsWidget  {...props.config} pnlNotionalDecimalPrecision={props.pnlNotionalDecimalPrecision} />
    </Flex>
  );
};
