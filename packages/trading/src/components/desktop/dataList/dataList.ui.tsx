import React from "react";
import { useEventEmitter, useMediaQuery } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { AssetsModule } from "@orderly.network/portfolio";
import { OrderStatus } from "@orderly.network/types";
import {
  Box,
  Divider,
  Flex,
  InfoCircleIcon,
  ScrollArea,
  TabPanel,
  Tabs,
  Tooltip,
} from "@orderly.network/ui";
import type { TabPanelProps } from "@orderly.network/ui";
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

const PositionsView: React.FC<DataListState> = (props) => {
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

export const LiquidationTab: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="oui-flex oui-space-x-1">
      <span>{t("positions.liquidation")}</span>
      <Tooltip
        className="oui-max-w-[275px] oui-bg-base-6"
        content={
          <div>
            <div className="oui-text-pretty">
              {t("positions.Liquidation.tooltip.liquidation")}
            </div>
            <div>
              <a
                href="https://orderly.network/docs/introduction/trade-on-orderly/perpetual-futures/liquidations"
                target="_blank"
                rel="noopener noreferrer"
                className="oui-text-primary"
              >
                {t("positions.Liquidation.tooltip.viewMore")}
              </a>
            </div>
          </div>
        }
        arrow={{ className: "oui-fill-base-6" }}
      >
        <span className="oui-hidden group-data-[state=active]:oui-block oui-cursor-pointer">
          <InfoCircleIcon />
        </span>
      </Tooltip>
    </div>
  );
};

export const DataList: React.FC<DataListState> = (props) => {
  const { t } = useTranslation();
  const ee = useEventEmitter();
  const isWidthBetween1440And1680 = useMediaQuery(
    "(min-width: 1440px) and (max-width: 1680px)",
  );
  const [isSideChatOpen, setIsSideChatOpen] = React.useState(false);

  const {
    positionCount = 0,
    pendingOrderCount = 0,
    tpSlOrderCount = 0,
    showAllSymbol,
    symbol,
    onSymbolChange,
    pnlNotionalDecimalPrecision,
    sharePnLConfig,
    setShowAllSymbol,
    current,
    unPnlPriceBasis,
    setUnPnlPriceBasic,
    setPnlNotionalDecimalPrecision,
  } = props;

  React.useEffect(() => {
    const handleToggle = (data: { isOpen: boolean }) => {
      setIsSideChatOpen(!!data.isOpen);
    };
    ee.on("sideChatPanel:toggle", handleToggle);
    const handleChatClosed = () => setIsSideChatOpen(false);
    window.addEventListener(
      "starchild:chatClosed",
      handleChatClosed as EventListener,
    );
    return () => {
      ee.off("sideChatPanel:toggle", handleToggle);
      window.removeEventListener(
        "starchild:chatClosed",
        handleChatClosed as EventListener,
      );
    };
  }, [ee]);

  const showDownsideWidget = isSideChatOpen && isWidthBetween1440And1680;

  const tabPanelItems: (TabPanelProps & { content?: React.ReactNode })[] = [
    {
      value: DataListTabType.positions,
      title: `${t("common.positions")} ${positionCount > 0 ? `(${positionCount})` : ""}`,
      content: <PositionsView {...props} />,
    },
    {
      value: DataListTabType.pending,
      title: `${t("orders.status.pending")} ${pendingOrderCount > 0 ? `(${pendingOrderCount})` : ""}`,
      content: (
        <DesktopOrderListWidget
          type={TabType.pending}
          ordersStatus={OrderStatus.INCOMPLETE}
          symbol={showAllSymbol ? undefined : symbol}
          onSymbolChange={onSymbolChange}
          testIds={{ tableBody: "oui-testid-dataList-pending-table-body" }}
        />
      ),
    },
    {
      value: DataListTabType.tp_sl,
      title: `${t("common.tpsl")} ${tpSlOrderCount > 0 ? `(${tpSlOrderCount})` : ""}`,
      content: (
        <DesktopOrderListWidget
          type={TabType.tp_sl}
          ordersStatus={OrderStatus.INCOMPLETE}
          symbol={showAllSymbol ? undefined : symbol}
          onSymbolChange={onSymbolChange}
          testIds={{ tableBody: "oui-testid-dataList-tpsl-table-body" }}
        />
      ),
    },
    {
      value: DataListTabType.filled,
      title: t("orders.status.filled"),
      content: (
        <DesktopOrderListWidget
          type={TabType.filled}
          symbol={showAllSymbol ? undefined : symbol}
          pnlNotionalDecimalPrecision={pnlNotionalDecimalPrecision}
          ordersStatus={OrderStatus.FILLED}
          onSymbolChange={onSymbolChange}
          testIds={{ tableBody: "oui-testid-dataList-filled-table-body" }}
          sharePnLConfig={sharePnLConfig}
        />
      ),
    },
    {
      value: DataListTabType.positionHistory,
      title: t("positions.positionHistory"),
      content: (
        <PositionHistoryWidget
          pnlNotionalDecimalPrecision={pnlNotionalDecimalPrecision}
          symbol={showAllSymbol ? undefined : symbol}
          onSymbolChange={onSymbolChange}
          sharePnLConfig={sharePnLConfig}
        />
      ),
    },
    {
      value: DataListTabType.orderHistory,
      title: t("orders.orderHistory"),
      content: (
        <DesktopOrderListWidget
          type={TabType.orderHistory}
          pnlNotionalDecimalPrecision={pnlNotionalDecimalPrecision}
          symbol={showAllSymbol ? undefined : symbol}
          onSymbolChange={onSymbolChange}
          testIds={{ tableBody: "oui-testid-dataList-orderHistory-table-body" }}
          sharePnLConfig={sharePnLConfig}
        />
      ),
    },
    {
      value: DataListTabType.liquidation,
      title: <LiquidationTab />,
      content: (
        <LiquidationWidget symbol={showAllSymbol ? undefined : symbol} />
      ),
    },
    {
      value: DataListTabType.assets,
      title: t("common.assets"),
      content: (
        <Flex
          width="100%"
          height="100%"
          className="oui-overflow-y-auto oui-hide-scrollbar oui-pt-3"
        >
          <AssetsModule.AssetsDataTableWidget
            classNames={{
              scrollRoot:
                "oui-h-full oui-mb-6 oui-mt-0 oui-p-0 oui-pt-3 oui-h-[calc(100%_-_40px)]",
              root: "oui-gap-4 oui-h-full",
              desc: "oui-ml-1",
            }}
            dataTableClassNames={{
              header: "oui-bg-base-9",
              root: "oui-h-[calc(100%_-_28px)]",
            }}
          />
        </Flex>
      ),
    },
  ];

  return (
    <Tabs
      defaultValue={current || DataListTabType.positions}
      variant="contained"
      size="lg"
      className="oui-h-full oui-w-full oui-overflow-x-hidden"
      classNames={{
        trigger: "oui-group",
        tabsContent: showDownsideWidget
          ? "oui-h-[calc(100%_-_60px)] oui-w-full oui-min-w-0 oui-max-w-full"
          : "oui-h-[calc(100%_-_32px)] oui-w-full oui-min-w-0 oui-max-w-full",
      }}
      trailing={
        !showDownsideWidget ? (
          <React.Suspense fallback={null}>
            <LazySettingWidget
              pnlNotionalDecimalPrecision={pnlNotionalDecimalPrecision}
              setPnlNotionalDecimalPrecision={setPnlNotionalDecimalPrecision}
              unPnlPriceBasis={unPnlPriceBasis}
              setUnPnlPriceBasic={setUnPnlPriceBasic}
              hideOtherSymbols={!showAllSymbol}
              setHideOtherSymbols={(value) => setShowAllSymbol(!value)}
            />
          </React.Suspense>
        ) : undefined
      }
    >
      {tabPanelItems.map((item) => {
        const { content, ...rest } = item;
        return (
          <TabPanel {...rest} key={`item-${rest.value}`}>
            {showDownsideWidget && (
              <Flex mt={1}>
                <React.Suspense fallback={null}>
                  <LazySettingWidget
                    pnlNotionalDecimalPrecision={pnlNotionalDecimalPrecision}
                    setPnlNotionalDecimalPrecision={
                      setPnlNotionalDecimalPrecision
                    }
                    unPnlPriceBasis={unPnlPriceBasis}
                    setUnPnlPriceBasic={setUnPnlPriceBasic}
                    hideOtherSymbols={!showAllSymbol}
                    setHideOtherSymbols={(value) => setShowAllSymbol(!value)}
                  />
                </React.Suspense>
              </Flex>
            )}
            {content}
          </TabPanel>
        );
      })}
    </Tabs>
  );
};
