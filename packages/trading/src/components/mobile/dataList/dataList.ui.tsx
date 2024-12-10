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
import {
  DataListState,
  DataListTabSubType,
  DataListTabType,
} from "./dataList.script";
import { MobileOrderListWidget, TabType } from "@orderly.network/ui-orders";
import { OrderStatus } from "@orderly.network/types";
import {
  MobilePositionHistoryWidget,
  MobilePositionsWidget,
} from "@orderly.network/ui-positions";
import { PositionHeaderWidget } from "../../base/positionHeader";

export const DataList: FC<
  DataListState & {
    className?: string;
  }
> = (props) => {
  return (
    <Tabs
      value={props.tab}
      onValueChange={(e: any) => props.setTab(e)}
      size="lg"
      className={props.className}
      classNames={{
        tabsList: "oui-bg-base-9 oui-rounded-t-xl oui-p-2",
      }}
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
        <HistoryTab {...props} />
      </TabPanel>
    </Tabs>
  );
};

const PositionsView: FC<DataListState> = (props) => {
  return (
    <Flex direction={"column"} gap={2}>
      <PositionHeaderWidget
        pnlNotionalDecimalPrecision={props.pnlNotionalDecimalPrecision}
        symbol={props.showAllSymbol ? undefined : props.symbol}
        unPnlPriceBasis={props.unPnlPriceBasis}
        tabletMediaQuery={props.tabletMediaQuery}
      />
      <MobilePositionsWidget
        symbol={props.showAllSymbol ? undefined : props.symbol}
        onSymbolChange={props.onSymbolChange}
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
    <Flex direction={"column"} pb={2} width={"100%"}>
      <Divider className="oui-w-full" />
      {props.type !== TabType.orderHistory && (
        <SymbolControlHeader {...props} />
      )}
      <MobileOrderListWidget
        symbol={props.showAllSymbol ? undefined : props.symbol}
        onSymbolChange={props.onSymbolChange}
        type={props.type}
        ordersStatus={props.ordersStatus}
        classNames={{
          root: "oui-w-full oui-hide-scrollbar oui-overflow-y-hidden",
          content: "!oui-space-y-1",
          cell: "oui-py-2 oui-bg-base-9 oui-p-2 oui-rounded-xl",
        }}
        showFilter={props.type === TabType.orderHistory}
        filterConfig={{
          range: {
            from: undefined,
            to: undefined,
          },
        }}
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
    <Flex
      px={2}
      py={2}
      width={"100%"}
      justify={"between"}
      gap={2}
      className="oui-rounded-b-xl oui-bg-base-9"
    >
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

const HistoryTab: FC<DataListState> = (props) => {
  return (
    <Tabs
      value={props.subTab}
      onValueChange={(e: any) => props.setSubTab(e)}
      size="md"
      classNames={{
        tabsList: "oui-bg-base-9 oui-rounded-t-xl oui-p-2",
      }}
    >
      <TabPanel
        title={DataListTabSubType.positionHistory}
        value={DataListTabSubType.positionHistory}
      >
        <MobilePositionHistoryWidget
          symbol={props.showAllSymbol ? undefined : props.symbol}
          onSymbolChange={props.onSymbolChange}
          classNames={{ cell: "oui-p-2 oui-bg-base-9 oui-rounded-xl" }}
        />
      </TabPanel>
      <TabPanel
        title={DataListTabSubType.orderHistory}
        value={DataListTabSubType.orderHistory}
      >
        <OrdersView type={TabType.orderHistory} {...props} />
      </TabPanel>
    </Tabs>
  );
};
