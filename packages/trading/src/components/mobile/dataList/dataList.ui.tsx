/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { AssetsModule } from "@orderly.network/portfolio";
import { OrderStatus } from "@orderly.network/types";
import {
  Button,
  Checkbox,
  Divider,
  Flex,
  TabPanel,
  Tabs,
  Text,
} from "@orderly.network/ui";
import type { TabPanelProps } from "@orderly.network/ui";
import { MobileOrderListWidget, TabType } from "@orderly.network/ui-orders";
import {
  MobileLiquidationWidget,
  MobilePositionHistoryWidget,
  MobilePositionsWidget,
} from "@orderly.network/ui-positions";
import {
  type DataListState,
  DataListTabSubType,
  DataListTabType,
} from "./dataList.script";

const LazyPositionHeaderWidget = React.lazy(() =>
  import("../../base/positionHeader").then((mod) => {
    return { default: mod.PositionHeaderWidget };
  }),
);

const SymbolControlHeader: React.FC<
  DataListState & { type: TabType; ordersStatus?: OrderStatus }
> = (props) => {
  const { t } = useTranslation();
  return (
    <Flex
      px={2}
      py={2}
      width={"100%"}
      justify={"between"}
      gap={2}
      className="oui-rounded-b-xl oui-bg-base-9"
    >
      <Flex className="oui-cursor-pointer oui-gap-[2px]">
        <Checkbox
          color="white"
          checked={!props.showAllSymbol}
          onCheckedChange={(checked: boolean) => {
            props.setShowAllSymbol(!checked);
          }}
        />
        <Text
          size="2xs"
          intensity={54}
          onClick={() => {
            props.setShowAllSymbol(!props.showAllSymbol);
          }}
        >
          {t("trading.hideOtherSymbols")}
        </Text>
      </Flex>
      <Button
        variant="outlined"
        size="xs"
        color="secondary"
        onClick={() => props.onCloseAll(props.type)}
      >
        {t("trading.orders.closeAll")}
      </Button>
    </Flex>
  );
};

const OrdersView: React.FC<
  DataListState & { type: TabType; ordersStatus?: OrderStatus }
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
        sharePnLConfig={props.sharePnLConfig}
        showFilter={props.type === TabType.orderHistory}
        filterConfig={{ range: { from: undefined, to: undefined } }}
      />
    </Flex>
  );
};

const PositionsView: React.FC<DataListState> = (props) => {
  return (
    <Flex direction={"column"} gap={2}>
      <React.Suspense fallback={null}>
        <LazyPositionHeaderWidget
          pnlNotionalDecimalPrecision={props.pnlNotionalDecimalPrecision}
          symbol={props.showAllSymbol ? undefined : props.symbol}
          unPnlPriceBasis={props.unPnlPriceBasis}
        />
      </React.Suspense>
      <React.Suspense fallback={null}>
        <MobilePositionsWidget
          symbol={props.showAllSymbol ? undefined : props.symbol}
          onSymbolChange={props.onSymbolChange}
          sharePnLConfig={props.sharePnLConfig}
          pnlNotionalDecimalPrecision={props.pnlNotionalDecimalPrecision}
        />
      </React.Suspense>
    </Flex>
  );
};

const HistoryTab: React.FC<DataListState> = (props) => {
  const { t } = useTranslation();
  return (
    <div className="oui-min-h-[300px]">
      <Tabs
        value={props.subTab}
        onValueChange={(e: any) => props.setSubTab(e)}
        size="md"
        classNames={{ tabsList: "oui-bg-base-9 oui-rounded-t-xl oui-p-2" }}
      >
        <TabPanel
          title={t("positions.positionHistory")}
          value={DataListTabSubType.positionHistory}
        >
          <MobilePositionHistoryWidget
            symbol={props.showAllSymbol ? undefined : props.symbol}
            onSymbolChange={props.onSymbolChange}
            classNames={{ cell: "oui-p-2 oui-bg-base-9 oui-rounded-xl" }}
            sharePnLConfig={props.sharePnLConfig}
          />
        </TabPanel>
        <TabPanel
          title={t("orders.orderHistory")}
          value={DataListTabSubType.orderHistory}
        >
          <OrdersView type={TabType.orderHistory} {...props} />
        </TabPanel>
      </Tabs>
    </div>
  );
};

export const DataList: React.FC<DataListState & { className?: string }> = (
  props,
) => {
  const { t } = useTranslation();
  const {
    positionCount = 0,
    pendingOrderCount = 0,
    tpSlOrderCount = 0,
    showAllSymbol,
    symbol,
    tab,
    setTab,
    className,
  } = props;

  const tabPanelItems: (TabPanelProps & { content?: React.ReactNode })[] = [
    {
      title: `${t("common.positions")} ${positionCount > 0 ? `(${positionCount})` : ""}`,
      value: DataListTabType.position,
      content: <PositionsView {...props} />,
    },
    {
      title: `${t("orders.status.pending")} ${pendingOrderCount > 0 ? `(${pendingOrderCount})` : ""}`,
      value: DataListTabType.pending,
      content: (
        <OrdersView
          type={TabType.pending}
          ordersStatus={OrderStatus.INCOMPLETE}
          {...props}
        />
      ),
    },
    {
      title: `${t("common.tpsl")} ${tpSlOrderCount > 0 ? `(${tpSlOrderCount})` : ""}`,
      value: DataListTabType.tp_sl,
      content: (
        <OrdersView
          type={TabType.tp_sl}
          ordersStatus={OrderStatus.INCOMPLETE}
          {...props}
        />
      ),
    },
    {
      title: t("trading.history"),
      value: DataListTabType.history,
      content: <HistoryTab {...props} />,
    },
    {
      title: t("positions.liquidation"),
      value: DataListTabType.liquidation,
      content: (
        <MobileLiquidationWidget
          enableLoadMore
          symbol={showAllSymbol ? undefined : symbol}
          classNames={{ cell: "oui-p-2 oui-bg-base-9 oui-rounded-xl" }}
        />
      ),
    },
    // {
    //   title: t("common.assets"),
    //   value: DataListTabType.assets,
    //   content: <AssetsModule.AssetsWidget />,
    // },
  ];

  return (
    <Tabs
      value={tab}
      defaultValue={DataListTabType.position}
      onValueChange={(e) => setTab(e as DataListTabType)}
      size="lg"
      className={className}
      classNames={{
        tabsList:
          "oui-bg-base-9 oui-rounded-t-xl oui-p-2 oui-overflow-x-scroll oui-hide-scrollbar",
      }}
    >
      {tabPanelItems.map((item) => {
        const { content, ...rest } = item;
        return (
          <TabPanel {...rest} key={`item-${rest.value}`}>
            {content}
          </TabPanel>
        );
      })}
    </Tabs>
  );
};
