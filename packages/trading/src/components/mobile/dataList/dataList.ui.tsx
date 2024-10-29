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
import { DataListState, DataListTabType } from "./dataList.script";
import { MobileOrderListWidget, TabType } from "@orderly.network/ui-orders";
import { OrderStatus } from "@orderly.network/types";
import { MobilePositionsWidget } from "@orderly.network/ui-positions";
import { PositionHeaderWidget } from "../../base/positionHeader";

export const DataList: FC<
  DataListState & {
    className?: string;
  }
> = (props) => {
  return (
    <Tabs
      variant="contained"
      value={props.tab}
      onValueChange={(e: any) => props.setTab(e)}
      size="lg"
      className={props.className}
    >
      <TabPanel
        title={
          (props.positionCount ?? 0) > 0
            ? `${DataListTabType.position}(${props.positionCount})`
            : DataListTabType.position
        }
        value={DataListTabType.position}
      >
        <PositionsView {...props} />
      </TabPanel>
      <TabPanel
        title={
          (props.pendingOrderCount ?? 0) > 0
            ? `${DataListTabType.pending}(${props.pendingOrderCount})`
            : DataListTabType.pending
        }
        value={DataListTabType.pending}
      >
        <OrdersView
          type={TabType.pending}
          ordersStatus={OrderStatus.INCOMPLETE}
          {...props}
        />
      </TabPanel>
      <TabPanel
        title={
          (props.tpSlOrderCount ?? 0) > 0
            ? `${DataListTabType.tp_sl}(${props.tpSlOrderCount})`
            : DataListTabType.tp_sl
        }
        value={DataListTabType.tp_sl}
      >
        <OrdersView
          type={TabType.tp_sl}
          ordersStatus={OrderStatus.INCOMPLETE}
          {...props}
        />
      </TabPanel>
      <TabPanel title={DataListTabType.history} value={DataListTabType.history}>
        <OrdersView type={TabType.orderHistory} {...props} />
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
      <div className="oui-mt-2"></div>
      <MobilePositionsWidget
        symbol={props.showAllSymbol ? undefined : props.symbol}
        sharePnLConfig={props.sharePnLConfig}
        pnlNotionalDecimalPrecision={props.pnlNotionalDecimalPrecision}
      />
    </Flex>
  );
};

const OrdersView: FC<
  DataListState & {
    type: TabType;
    ordersStatus?: OrderStatus;
  }
> = (props) => {
  return (
    <Flex direction={"column"} gap={2} py={2} width={"100%"}>
      <Divider className="oui-w-full" />
      {props.type !== TabType.orderHistory && (
        <SymbolControlHeader {...props} />
      )}
      <MobileOrderListWidget
        symbol={props.showAllSymbol ? undefined : props.symbol}
        type={props.type}
        ordersStatus={props.ordersStatus}
        classNames={{
          root: "oui-w-full oui-hide-scrollbar oui-overflow-y-hidden",
          cell: "oui-py-2",
        }}
        showFilter={props.type === TabType.orderHistory}
      />
    </Flex>
  );
};

const SymbolControlHeader: FC<
  DataListState & {
    type: TabType;
    ordersStatus?: OrderStatus;
  }
> = (props) => {
  return (
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
          Show all trading pairs
        </Text>
      </Flex>
      <Button
        variant="outlined"
        size="xs"
        color="secondary"
        onClick={(e) => {
          props.onCloseAll(props.type);
        }}
      >
        Close All
      </Button>
    </Flex>
  );
};
