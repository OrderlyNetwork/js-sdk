import { FC } from "react";
import { Divider, Flex, TabPanel, Tabs, Text } from "@orderly.network/ui";
import { DataListState, DataListTabType } from "./dataList.script";
import { PositionsWidget } from "@orderly.network/ui-positions";
import { DesktopOrderListWidget, TabType } from "@orderly.network/ui-orders";
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
      size="lg"
      classNames={{
        tabsList: "oui-px-3",
      }}
    >
      <TabPanel
        value={DataListTabType.positions}
        title={
          (props.positionCount ?? 0) > 0
            ? `${DataListTabType.positions}(${props.positionCount})`
            : DataListTabType.positions
        }
      >
        <PositionsView {...props} />
      </TabPanel>
      <TabPanel
        value={DataListTabType.pending}
        title={
          (props.pendingOrderCount ?? 0) > 0
            ? `${DataListTabType.pending}(${props.pendingOrderCount})`
            : DataListTabType.pending
        }
      >
        <DesktopOrderListWidget
          type={TabType.pending}
          ordersStatus={OrderStatus.INCOMPLETE}
          symbol={props.showAllSymbol ? undefined : props.symbol}
        />
      </TabPanel>
      <TabPanel
        value={DataListTabType.tp_sl}
        title={
          (props.tpSlOrderCount ?? 0) > 0
            ? `${DataListTabType.tp_sl}(${props.tpSlOrderCount})`
            : DataListTabType.tp_sl
        }
      >
        <DesktopOrderListWidget
          type={TabType.tp_sl}
          ordersStatus={OrderStatus.INCOMPLETE}
          symbol={props.showAllSymbol ? undefined : props.symbol}
        />
      </TabPanel>
      <TabPanel value={DataListTabType.filled} title={DataListTabType.filled}>
        <DesktopOrderListWidget
          type={TabType.filled}
          ordersStatus={OrderStatus.FILLED}
        />
      </TabPanel>
      <TabPanel
        value={DataListTabType.orderHistory}
        title={DataListTabType.orderHistory}
      >
        <DesktopOrderListWidget
          type={TabType.orderHistory}
        />
      </TabPanel>
    </Tabs>
  );
};

const PositionsView: FC<DataListState> = (props) => {
  return (
    <Flex direction={"column"}>
      <PositionHeaderWidget
        pnlNotionalDecimalPrecision={props.pnlNotionalDecimalPrecision}
        symbol={props.symbol}
        unPnlPriceBasis={props.unPnlPriceBasis}
        tabletMediaQuery={props.tabletMediaQuery}
      />
      <Divider className="oui-w-full" />
      <PositionsWidget
        symbol={props.showAllSymbol ? undefined : props.symbol}
        pnlNotionalDecimalPrecision={props.pnlNotionalDecimalPrecision}
        sharePnLConfig={props.sharePnLConfig}
        calcMode={props.calcMode}
        includedPendingOrder={props.includedPendingOrder}
      />
    </Flex>
  );
};
