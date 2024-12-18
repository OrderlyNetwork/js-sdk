import { FC } from "react";
import { Box, Divider, Flex, TabPanel, Tabs, Text } from "@orderly.network/ui";
import { DataListState, DataListTabType } from "./dataList.script";
import {
  LiquidationWidget,
  PositionHistoryWidget,
  PositionsWidget,
} from "@orderly.network/ui-positions";
import { DesktopOrderListWidget, TabType } from "@orderly.network/ui-orders";
import { OrderStatus } from "@orderly.network/types";
import { PositionHeaderWidget } from "../../base/positionHeader";
import { SettingWidget } from "./setting";

export const DataList: FC<DataListState> = (props) => {
  // return (
  //   <DesktopOrderListWidget
  //     type={TabType.orderHistory}
  //     onSymbolChange={props.onSymbolChange}
  //   />
  // );
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
          hideOtherSymbols={!props.showAllSymbol}
          setHideOtherSymbols={(value: boolean) =>
            props.setShowAllSymbol(!value)
          }
        />
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
        title={
          (props.positionCount ?? 0) > 0
            ? `${DataListTabType.positions}(${props.positionCount})`
            : DataListTabType.positions
        }
      >
        <PositionsView {...props} />
      </TabPanel>
      <TabPanel
        testid="oui-testid-dataList-pending-tab"
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
        title={
          (props.tpSlOrderCount ?? 0) > 0
            ? `${DataListTabType.tp_sl}(${props.tpSlOrderCount})`
            : DataListTabType.tp_sl
        }
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
        title={DataListTabType.filled}
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
        />
      </TabPanel>
      <TabPanel
        testid="oui-testid-dataList-positionHistory-tab"
        value={DataListTabType.positionHistory}
        title={DataListTabType.positionHistory}
      >
        <PositionHistoryWidget
          pnlNotionalDecimalPrecision={props.pnlNotionalDecimalPrecision}
          symbol={!!props.showAllSymbol ? undefined : props.symbol}
          onSymbolChange={props.onSymbolChange}
        />
      </TabPanel>
      <TabPanel
        testid="oui-testid-dataList-orderHistory-tab"
        value={DataListTabType.orderHistory}
        title={DataListTabType.orderHistory}
      >
        <DesktopOrderListWidget
          type={TabType.orderHistory}
          pnlNotionalDecimalPrecision={props.pnlNotionalDecimalPrecision}
          symbol={!!props.showAllSymbol ? undefined : props.symbol}
          onSymbolChange={props.onSymbolChange}
          testIds={{
            tableBody: "oui-testid-dataList-orderHistory-table-body",
          }}
        />
      </TabPanel>
      <TabPanel
        testid="oui-testid-dataList-liquidation-tab"
        value={DataListTabType.liquidation}
        title={DataListTabType.liquidation}
      >
        <Box className="oui-h-[calc(100%_-_49px)]" width="100%">
          <LiquidationWidget
            symbol={!!props.showAllSymbol ? undefined : props.symbol}
          />
        </Box>
      </TabPanel>
    </Tabs>
  );
};

const PositionsView: FC<DataListState> = (props) => {
  return (
    <Flex direction="column" width="100%" height="100%">
      <PositionHeaderWidget
        pnlNotionalDecimalPrecision={props.pnlNotionalDecimalPrecision}
        symbol={!!props.showAllSymbol ? undefined : props.symbol}
        unPnlPriceBasis={props.unPnlPriceBasis}
      />
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
