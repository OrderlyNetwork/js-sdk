import { FC } from "react";
import { Divider, Flex, TabPanel, Tabs, Text } from "@orderly.network/ui";
import { BottomTabState, BottomTabType } from "./bottomTab.script";
import { MobileOrderListWidget, TabType } from "@orderly.network/ui-orders";
import { OrderStatus } from "@orderly.network/types";
import { MobilePositionsWidget, PositionsWidget } from "@orderly.network/ui-positions";
import { PositionHeaderWidget } from "../../base/positionHeader";

export const BottomTab: FC<
  BottomTabState & {
    className?: string;
  }
> = (props) => {
  return (
    <Tabs
      variant="contained"
      value={props.tab}
      onValueChange={(e: any) => props.setTab(e)}
      className={props.className}
    >
      <TabPanel title={BottomTabType.position} value={BottomTabType.position}>
        <PositionsView {...props} />
      </TabPanel>
      <TabPanel title={BottomTabType.pending} value={BottomTabType.pending}>
        <MobileOrderListWidget
          type={TabType.pending}
          ordersStatus={OrderStatus.INCOMPLETE}
        />
      </TabPanel>
      <TabPanel title={BottomTabType.tp_sl} value={BottomTabType.tp_sl}>
        <MobileOrderListWidget
          type={TabType.tp_sl}
          ordersStatus={OrderStatus.INCOMPLETE}
        />
      </TabPanel>
      <TabPanel title={BottomTabType.history} value={BottomTabType.history}>
        <MobileOrderListWidget
          type={TabType.orderHistory}
          ordersStatus={OrderStatus.INCOMPLETE}
        />
      </TabPanel>
    </Tabs>
  );
};

const PositionsView: FC<BottomTabState> = (props) => {
  return (
    <Flex direction={"column"}>
      <PositionHeaderWidget
        pnlNotionalDecimalPrecision={props.pnlNotionalDecimalPrecision}
        symbol={props.symbol}
        unPnlPriceBasis={props.unPnlPriceBasis}
        tabletMediaQuery={props.tabletMediaQuery}
      />
      <div className="oui-mt-2"></div>
      <MobilePositionsWidget
        {...props.config}
        pnlNotionalDecimalPrecision={props.pnlNotionalDecimalPrecision}
      />
    </Flex>
  );
};
