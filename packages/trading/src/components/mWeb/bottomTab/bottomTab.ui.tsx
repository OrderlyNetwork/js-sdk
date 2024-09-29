import { FC } from "react";
import {
  Button,
  Checkbox,
  Divider,
  Flex,
  TabPanel,
  Tabs,
  Text,
} from "@orderly.network/ui";
import { BottomTabState, BottomTabType } from "./bottomTab.script";
import { MobileOrderListWidget, TabType } from "@orderly.network/ui-orders";
import { OrderStatus } from "@orderly.network/types";
import {
  MobilePositionsWidget,
  PositionsWidget,
} from "@orderly.network/ui-positions";
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
        <OrdersView
          type={TabType.pending}
          ordersStatus={OrderStatus.INCOMPLETE}
          {...props}
        />
      </TabPanel>
      <TabPanel title={BottomTabType.tp_sl} value={BottomTabType.tp_sl}>
        <OrdersView
          type={TabType.tp_sl}
          ordersStatus={OrderStatus.INCOMPLETE}
          {...props}
          />
      </TabPanel>
      <TabPanel title={BottomTabType.history} value={BottomTabType.history}>
        <OrdersView
          type={TabType.orderHistory}
          ordersStatus={OrderStatus.INCOMPLETE}
          {...props}
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

const OrdersView: FC<
  BottomTabState & {
    type: TabType;
    ordersStatus: OrderStatus;
  }
> = (props) => {
  return (
    <Flex direction={"column"} gap={2} py={2} width={"100%"}>
      <Divider className="oui-w-full" />
      <Flex width={"100%"} justify={"between"} gap={2}>
        <Flex className="oui-gap-[2px] oui-cursor-pointer">
          <Checkbox
            color="white"
            checked={props.showAllSymbol}
            onCheckedChange={(checked: boolean) => {
              props.setShowAllSymbol(checked);
            }}
          />
          <Text
            size="2xs"
            intensity={54}
            onClick={() => {
              props.setShowAllSymbol(!props.showAllSymbol);
            }}
          >
            Show all instruments
          </Text>
        </Flex>
        <Button variant="outlined" size="xs" color="secondary">Close All</Button>
      </Flex>
      <MobileOrderListWidget
        type={props.type}
        ordersStatus={props.ordersStatus}
        classNames={{
          root: "oui-w-full",
          cell: "oui-py-2",
        }}
      />
    </Flex>
  );
};
