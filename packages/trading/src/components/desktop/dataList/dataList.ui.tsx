import React, { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { OrderStatus } from "@orderly.network/types";
import { Box, Divider, Flex, TabPanel, Tabs } from "@orderly.network/ui";
import { DesktopOrderListWidget, TabType } from "@orderly.network/ui-orders";
import {
  LiquidationWidget,
  PositionHistoryWidget,
  PositionsWidget,
} from "@orderly.network/ui-positions";
import { DataListState, DataListTabType } from "./dataList.script";

const LazySettingWidget = React.lazy(() =>
  import("./setting").then((mod) => {
    return { default: mod.SettingWidget };
  }),
);

const LazyPositionHeaderWidget = React.lazy(() =>
  import("../../base/positionHeader").then((mod) => {
    return { default: mod.PositionHeaderWidget };
  }),
);

export const DataList: FC<DataListState> = (props) => {
  const { t } = useTranslation();
  return (
    <Tabs
      defaultValue={props.current || DataListTabType.positions}
      variant="contained"
      trailing={
        <React.Suspense fallback={null}>
          <LazySettingWidget
            pnlNotionalDecimalPrecision={props.pnlNotionalDecimalPrecision}
            setPnlNotionalDecimalPrecision={
              props.setPnlNotionalDecimalPrecision
            }
            unPnlPriceBasis={props.unPnlPriceBasis}
            setUnPnlPriceBasic={props.setUnPnlPriceBasic}
            hideOtherSymbols={!props.showAllSymbol}
            setHideOtherSymbols={(value: boolean) =>
              props.setShowAllSymbol(!value)
            }
          />
        </React.Suspense>
      }
      size="lg"
      className="oui-h-full"
      classNames={{
        // tabsList: "oui-px-3",
        tabsContent: "oui-h-[calc(100%_-_32px)]",
      }}
    >
      <TabPanel
        testid="oui-testid-dataList-position-tab"
        value={DataListTabType.positions}
        title={`${t("common.positions")} ${
          (props.positionCount ?? 0) > 0 ? `(${props.positionCount})` : ""
        }`}
      >
        <PositionsView {...props} />
      </TabPanel>
      <TabPanel
        testid="oui-testid-dataList-pending-tab"
        value={DataListTabType.pending}
        title={`${t("orders.status.pending")} ${
          (props.pendingOrderCount ?? 0) > 0
            ? `(${props.pendingOrderCount})`
            : ""
        }`}
      >
        <DesktopOrderListWidget
          type={TabType.pending}
          ordersStatus={OrderStatus.INCOMPLETE}
          symbol={!!props.showAllSymbol ? undefined : props.symbol}
          onSymbolChange={props.onSymbolChange}
          testIds={{
            tableBody: "oui-testid-dataList-pending-table-body",
          }}
        />
      </TabPanel>
      <TabPanel
        testid="oui-testid-dataList-tpsl-tab"
        value={DataListTabType.tp_sl}
        title={`${t("common.tpsl")} ${
          (props.tpSlOrderCount ?? 0) > 0 ? `(${props.tpSlOrderCount})` : ""
        }`}
      >
        <DesktopOrderListWidget
          type={TabType.tp_sl}
          ordersStatus={OrderStatus.INCOMPLETE}
          symbol={!!props.showAllSymbol ? undefined : props.symbol}
          onSymbolChange={props.onSymbolChange}
          testIds={{
            tableBody: "oui-testid-dataList-tpsl-table-body",
          }}
        />
      </TabPanel>
      <TabPanel
        testid="oui-testid-dataList-filled-tab"
        value={DataListTabType.filled}
        title={t("orders.status.filled")}
      >
        <DesktopOrderListWidget
          type={TabType.filled}
          symbol={!!props.showAllSymbol ? undefined : props.symbol}
          pnlNotionalDecimalPrecision={props.pnlNotionalDecimalPrecision}
          ordersStatus={OrderStatus.FILLED}
          onSymbolChange={props.onSymbolChange}
          testIds={{
            tableBody: "oui-testid-dataList-filled-table-body",
          }}
          sharePnLConfig={props.sharePnLConfig}
        />
      </TabPanel>
      <TabPanel
        testid="oui-testid-dataList-positionHistory-tab"
        value={DataListTabType.positionHistory}
        title={t("positions.positionHistory")}
      >
        <PositionHistoryWidget
          pnlNotionalDecimalPrecision={props.pnlNotionalDecimalPrecision}
          symbol={!!props.showAllSymbol ? undefined : props.symbol}
          onSymbolChange={props.onSymbolChange}
          sharePnLConfig={props.sharePnLConfig}
        />
      </TabPanel>
      <TabPanel
        testid="oui-testid-dataList-orderHistory-tab"
        value={DataListTabType.orderHistory}
        title={t("orders.orderHistory")}
      >
        <DesktopOrderListWidget
          type={TabType.orderHistory}
          pnlNotionalDecimalPrecision={props.pnlNotionalDecimalPrecision}
          symbol={!!props.showAllSymbol ? undefined : props.symbol}
          onSymbolChange={props.onSymbolChange}
          testIds={{
            tableBody: "oui-testid-dataList-orderHistory-table-body",
          }}
          sharePnLConfig={props.sharePnLConfig}
        />
      </TabPanel>
      <TabPanel
        testid="oui-testid-dataList-liquidation-tab"
        value={DataListTabType.liquidation}
        title={t("positions.liquidation")}
      >
        <LiquidationWidget
          symbol={!!props.showAllSymbol ? undefined : props.symbol}
        />
      </TabPanel>
    </Tabs>
  );
};

const PositionsView: FC<DataListState> = (props) => {
  return (
    <Flex direction="column" width="100%" height="100%">
      <React.Suspense fallback={null}>
        <LazyPositionHeaderWidget
          pnlNotionalDecimalPrecision={props.pnlNotionalDecimalPrecision}
          symbol={!!props.showAllSymbol ? undefined : props.symbol}
          unPnlPriceBasis={props.unPnlPriceBasis}
        />
      </React.Suspense>
      <Divider className="oui-w-full" />
      <Box className="oui-h-[calc(100%_-_60px)]" width="100%">
        <PositionsWidget
          symbol={!!props.showAllSymbol ? undefined : props.symbol}
          pnlNotionalDecimalPrecision={props.pnlNotionalDecimalPrecision}
          sharePnLConfig={props.sharePnLConfig}
          calcMode={props.calcMode}
          includedPendingOrder={props.includedPendingOrder}
          onSymbolChange={props.onSymbolChange}
        />
      </Box>
    </Flex>
  );
};
