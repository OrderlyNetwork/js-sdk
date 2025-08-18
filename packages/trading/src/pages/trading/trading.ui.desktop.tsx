import { FC, useMemo } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import {
  SideMarketsWidget,
  SymbolInfoBarFullWidget,
} from "@orderly.network/markets";
import { TradingviewFullscreenKey } from "@orderly.network/types";
import { Box, cn, Flex } from "@orderly.network/ui";
import { OrderEntryWidget } from "@orderly.network/ui-order-entry";
import { TradingviewWidget } from "@orderly.network/ui-tradingview";
import { DepositStatusWidget } from "@orderly.network/ui-transfer";
import { AssetViewWidget } from "../../components/desktop/assetView";
import { DataListWidget } from "../../components/desktop/dataList";
import { RemovablePanel } from "../../components/desktop/layout/removablePanel";
import { SplitLayout } from "../../components/desktop/layout/splitLayout";
import { SwitchLayout } from "../../components/desktop/layout/switchLayout";
import { OrderBookAndTradesWidget } from "../../components/desktop/orderBookAndTrades";
import { RiskRateWidget } from "../../components/desktop/riskRate";
import {
  dataListInitialHeight,
  getOffsetSizeNum,
  TradingState,
} from "./trading.script";
import {
  scrollBarWidth,
  topBarHeight,
  bottomBarHeight,
  space,
  symbolInfoBarHeight,
  orderEntryMinWidth,
  orderEntryMaxWidth,
  orderbookMinWidth,
  orderbookMaxWidth,
  orderbookMinHeight,
  orderbookMaxHeight,
  tradindviewMinHeight,
  tradingViewMinWidth,
  dataListMaxHeight,
} from "./trading.script";

export type DesktopLayoutProps = TradingState & {
  className?: string;
};

export const DesktopLayout: FC<DesktopLayoutProps> = (props) => {
  const {
    resizeable,
    panelSize,
    onPanelSizeChange,
    layout,
    onLayout,
    orderBookSplitSize,
    setOrderbookSplitSize,
    dataListSplitSize,
    setDataListSplitSize,
    mainSplitSize,
    setMainSplitSize,
    dataListSplitHeightSM,
    setDataListSplitHeightSM,
    orderBookSplitHeightSM,
    setOrderbookSplitHeightSM,
    max2XL,
    max4XL,
    animating,
    setAnimating,
    positions,
    updatePositions,
    showPositionIcon,
    horizontalDraggable,
    marketsWidth,
    tradindviewMaxHeight,
    dataListMinHeight,
  } = props;

  const [tradingViewFullScreen] = useLocalStorage(
    TradingviewFullscreenKey,
    false,
  );

  const minScreenHeight = useMemo(() => {
    return tradingViewFullScreen
      ? 0
      : symbolInfoBarHeight +
          orderbookMaxHeight +
          dataListInitialHeight +
          space * 4;
  }, [tradingViewFullScreen]);

  const minScreenHeightSM =
    topBarHeight +
    bottomBarHeight +
    symbolInfoBarHeight +
    tradindviewMinHeight +
    orderbookMinHeight +
    dataListMinHeight +
    space * 4;

  const marketsWidget = (
    <SideMarketsWidget
      resizeable={resizeable}
      panelSize={panelSize}
      onPanelSizeChange={onPanelSizeChange as any}
      symbol={props.symbol}
      onSymbolChange={props.onSymbolChange}
    />
  );

  const marketsView = (
    <Box
      intensity={900}
      pt={3}
      r="2xl"
      height="100%"
      width={marketsWidth}
      style={{ minWidth: marketsWidth }}
      className="oui-transition-all oui-duration-150"
      onTransitionEnd={() => setAnimating(false)}
    >
      {!animating && marketsWidget}
    </Box>
  );

  const trailing = useMemo(() => {
    return <SwitchLayout layout={layout} onLayout={onLayout} />;
  }, [layout, onLayout]);

  const symbolInfoBarView = (
    <Box
      intensity={900}
      r="2xl"
      px={3}
      width="100%"
      style={{
        minHeight: symbolInfoBarHeight,
        height: symbolInfoBarHeight,
      }}
    >
      <SymbolInfoBarFullWidget
        symbol={props.symbol}
        onSymbolChange={props.onSymbolChange}
        trailing={trailing}
      />
    </Box>
  );

  const { library_path, ...restTradingViewConfig } = props.tradingViewConfig;

  const tradingviewWidget = (
    <TradingviewWidget
      classNames={{
        root: cn(
          tradingViewFullScreen
            ? "!oui-absolute oui-top-0 oui-left-0 oui-right-0 oui-bottom-0 oui-z-[40] oui-bg-base-10"
            : "oui-z-1",
        ),
        content: cn(
          tradingViewFullScreen
            ? "oui-top-3 oui-bottom-3 oui-left-3 oui-right-3 oui-bg-base-9 oui-rounded-[16px] oui-overflow-hidden"
            : "",
        ),
      }}
      symbol={props.symbol}
      {...restTradingViewConfig}
      libraryPath={library_path}
    />
  );

  const tradingView = (
    <Box
      width="100%"
      height="100%"
      intensity={900}
      r="2xl"
      style={{ flex: 1, minWidth: tradingViewMinWidth }}
      className="oui-overflow-hidden"
    >
      {tradingviewWidget}
    </Box>
  );

  const orderbookWidget = <OrderBookAndTradesWidget symbol={props.symbol} />;

  const orderbookView = (
    <Box
      r="2xl"
      height="100%"
      style={{
        minWidth: orderbookMinWidth,
        maxWidth: horizontalDraggable ? orderbookMaxWidth : orderbookMinWidth,
        width: orderBookSplitSize,
      }}
      className="oui-overflow-hidden"
    >
      {orderbookWidget}
    </Box>
  );

  const dataListWidget = (
    <DataListWidget
      current={undefined}
      symbol={props.symbol}
      sharePnLConfig={props.sharePnLConfig}
    />
  );

  const dataListView = (
    <Box
      intensity={900}
      r="2xl"
      p={2}
      style={{
        height: dataListSplitSize,
        // height: `calc(100% - ${symbolInfoBarHeight}px - ${orderbookMaxHeight}px - ${space}px)`,
        minHeight: dataListInitialHeight,
        // minHeight: `max(${dataListMinHeight}px, calc(100vh - ${symbolInfoBarHeight}px - ${orderbookMaxHeight}px - ${space}px))`,
      }}
      className="oui-overflow-hidden"
    >
      {dataListWidget}
    </Box>
  );

  const assetsOrderEntryMargin = [
    <RemovablePanel
      key="margin"
      index={positions.findIndex((item) => item === 0)}
      onLayout={updatePositions}
      showIndicator={showPositionIcon}
    >
      <RiskRateWidget />
    </RemovablePanel>,
    <RemovablePanel
      key="assets"
      className="oui-border oui-border-line-12"
      index={positions.findIndex((item) => item === 1)}
      onLayout={updatePositions}
      showIndicator={showPositionIcon}
    >
      <>
        <AssetViewWidget isFirstTimeDeposit={props.isFirstTimeDeposit} />
        <DepositStatusWidget
          className="oui-mt-3 oui-gap-y-2"
          onClick={props.navigateToPortfolio}
        />
      </>
    </RemovablePanel>,
    <RemovablePanel
      key="orderEntry"
      index={positions.findIndex((item) => item === 2)}
      onLayout={updatePositions}
      showIndicator={showPositionIcon}
    >
      <OrderEntryWidget
        symbol={props.symbol}
        disableFeatures={
          props.disableFeatures as unknown as ("slippageSetting" | "feesInfo")[]
        }
      />
    </RemovablePanel>,
  ];

  const orderEntryWidget = positions.map(
    (index) => assetsOrderEntryMargin[index],
  );

  const orderEntryView = (
    <Flex
      gapY={2}
      direction="column"
      height="100%"
      style={{
        minWidth: orderEntryMinWidth,
        maxWidth: horizontalDraggable ? orderEntryMaxWidth : orderEntryMinWidth,
        width: mainSplitSize,
      }}
    >
      {orderEntryWidget}
    </Flex>
  );

  const renderTradingView = () => {
    if (max4XL && layout === "right") {
      return (
        <Flex
          gap={2}
          className="oui-flex-1 oui-overflow-hidden"
          style={{ minWidth: marketsWidth + tradingViewMinWidth + space }}
        >
          {marketsView}
          {tradingView}
        </Flex>
      );
    }

    return tradingView;
  };

  const tradingViewAndOrderbookView = (
    <SplitLayout
      style={{
        // the style width is not set, and a child node style needs to be set to flex: 1 to adapt
        flex: 1,
        minHeight: orderbookMinHeight,
        // maxHeight: orderbookMaxHeight,
      }}
      onSizeChange={setOrderbookSplitSize}
      disable={!horizontalDraggable}
    >
      {renderTradingView()}
      {orderbookView}
    </SplitLayout>
  );

  const renderTradingViewAndOrderbookView = () => {
    if (max4XL && layout === "left") {
      return (
        <Flex
          gapX={2}
          style={{
            minHeight: orderbookMinHeight,
            // maxHeight: orderbookMaxHeight,
            // minWidth:
            //   marketsWidth +
            //   tradingViewMinWidth +
            //   orderbookMinWidth +
            //   space * 2,
          }}
          height="100%"
        >
          {tradingViewAndOrderbookView}
          {marketsView}
        </Flex>
      );
    }
    return tradingViewAndOrderbookView;
  };

  const mainView = (
    <Flex
      direction="column"
      className="oui-flex-1 oui-overflow-hidden"
      gap={2}
      style={{
        minWidth: max4XL
          ? marketsWidth + tradingViewMinWidth + orderbookMinWidth + space * 2
          : tradingViewMinWidth + orderbookMinWidth + space,
      }}
    >
      {symbolInfoBarView}
      <SplitLayout
        style={{
          // height: orderbookMaxHeight + dataListInitialHeight + space,
          maxHeight: `calc(100% - ${symbolInfoBarHeight}px - ${space}px)`,
        }}
        className="oui-w-full"
        mode="vertical"
        onSizeChange={setDataListSplitSize}
      >
        {renderTradingViewAndOrderbookView()}
        {dataListView}
      </SplitLayout>
    </Flex>
  );

  const onSizeChange = (width: string) =>
    layout === "left"
      ? setMainSplitSize(getOffsetSizeNum(width))
      : setMainSplitSize(width);

  if (max2XL) {
    return (
      <SplitLayout
        ref={props.max2XLSplitRef}
        style={{
          minHeight: minScreenHeightSM,
          minWidth: 1024 - scrollBarWidth,
          // height: props.extraHeight ? props.extraHeight : undefined,
        }}
        className={cn(
          "oui-flex oui-flex-1 ",
          "oui-size-full oui-min-w-[1018px]",
          "oui-px-3 oui-py-2",
          props.className,
        )}
        onSizeChange={setDataListSplitHeightSM}
        onDragging={props.onDataListSplitHeightDragging}
        mode="vertical"
      >
        <Flex
          gapX={2}
          itemAlign="stretch"
          className={cn(
            "oui-flex-1",
            layout === "left" && "oui-flex-row-reverse",
          )}
          style={{
            minHeight: Math.max(
              symbolInfoBarHeight +
                tradindviewMinHeight +
                orderbookMinHeight +
                space * 2,
              props.orderEntryHeight,
            ),
            maxHeight:
              symbolInfoBarHeight +
              tradindviewMaxHeight +
              orderbookMaxHeight +
              space * 2,
          }}
        >
          <Flex
            height="100%"
            className="oui-flex-1 oui-w-[calc(100%_-_280px_-_12px)]"
            direction="column"
            gapY={2}
          >
            {symbolInfoBarView}
            <Flex
              width="100%"
              height="100%"
              gapX={2}
              itemAlign="stretch"
              style={{
                minHeight: tradindviewMinHeight + orderbookMinHeight + space,
                maxHeight: tradindviewMaxHeight + orderbookMaxHeight + space,
              }}
              className={cn(
                "oui-flex-1",
                layout === "left" && "oui-flex-row-reverse",
              )}
            >
              <Box
                intensity={900}
                pt={3}
                r="2xl"
                width={marketsWidth}
                style={{
                  minHeight: tradindviewMinHeight + orderbookMinHeight + space,
                  maxHeight: tradindviewMaxHeight + orderbookMaxHeight + space,
                }}
              >
                {marketsWidget}
              </Box>
              <SplitLayout
                ref={props.tradingviewAndOrderbookSplitRef}
                mode="vertical"
                style={{
                  width: `calc(100% - ${marketsWidth}px)`,
                }}
                className="oui-flex-1"
                onSizeChange={setOrderbookSplitHeightSM}
                onDragging={props.onTradingviewAndOrderbookDragging}
              >
                <Box
                  width="100%"
                  intensity={900}
                  r="2xl"
                  style={{
                    minHeight: tradindviewMinHeight,
                    maxHeight: tradindviewMaxHeight,
                    height: 1200,
                  }}
                >
                  {tradingviewWidget}
                </Box>

                <Box
                  r="2xl"
                  height="100%"
                  width="100%"
                  style={{
                    minHeight: orderbookMinHeight,
                    maxHeight: orderbookMaxHeight,
                    height: orderBookSplitHeightSM,
                  }}
                  className="oui-flex-1"
                >
                  {orderbookWidget}
                </Box>
              </SplitLayout>
            </Flex>
          </Flex>
          <Flex
            ref={props.orderEntryViewRef}
            id="orderEntryView"
            gapY={3}
            direction="column"
            className="oui-relative"
            style={{
              width: orderEntryMinWidth,
              // force order entry render actual content height
              height: "max-content",
              // height:
              //   props.extraHeight && props.extraHeight > 100
              //     ? undefined
              // : "max-content",
            }}
          >
            {orderEntryWidget}
            <Box height={props.extraHeight} />
          </Flex>
        </Flex>

        <Box
          intensity={900}
          r="2xl"
          p={2}
          style={{
            height: dataListSplitHeightSM,
            minHeight: Math.max(dataListMinHeight, props.dataListHeight),
            maxHeight: dataListMaxHeight,
          }}
          className="oui-overflow-hidden"
        >
          {dataListWidget}
        </Box>
      </SplitLayout>
    );
  }

  return (
    <Flex
      style={{
        minHeight: minScreenHeight,
        minWidth: 1440 - scrollBarWidth,
      }}
      className={cn(
        props.className,
        layout === "left" && "oui-flex-row-reverse",
        tradingViewFullScreen &&
          "oui-relative oui-w-screen oui-h-[calc(100vh-80px)] !oui-p-0 oui-overflow-hidden",
      )}
      width="100%"
      p={2}
      gap={2}
    >
      {!max4XL && marketsView}
      <SplitLayout
        className="oui-flex oui-flex-1 oui-overflow-hidden"
        onSizeChange={onSizeChange}
        disable={!horizontalDraggable}
      >
        {layout === "left" && orderEntryView}
        {mainView}
        {layout === "right" && orderEntryView}
      </SplitLayout>
    </Flex>
  );
};
