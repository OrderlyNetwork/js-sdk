import { FC, useMemo } from "react";
import { Box, cn, Flex } from "@orderly.network/ui";
import { getOffsetSizeNum, TradingState } from "./trading.script";
import { DataListWidget } from "../../components/desktop/dataList";
import {
  TradingviewWidget,
  TradingviewLocaleCode,
} from "@orderly.network/ui-tradingview";
import { AssetViewWidget } from "../../components/desktop/assetView";
import { RiskRateWidget } from "../../components/desktop/riskRate";
import { OrderBookAndTradesWidget } from "../../components/desktop/orderBookAndTrades";
import {
  SideMarketsWidget,
  SymbolInfoBarFullWidget,
} from "@orderly.network/markets";
import { SwitchLayout } from "../../components/desktop/layout/switchLayout";
import { SplitLayout } from "../../components/desktop/layout/splitLayout";
import { RemovablePanel } from "../../components/desktop/layout/removablePanel";
import { OrderEntryWidget } from "@orderly.network/ui-order-entry";
import { i18n } from "@orderly.network/i18n";

export type DesktopLayoutProps = TradingState & {
  className?: string;
};

export const DesktopLayout: FC<DesktopLayoutProps> = (props) => {
  const {
    collapsable,
    collapsed,
    onCollapse,
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
    canTrade,
    showPositionIcon,
    horizontalDraggable,
  } = props;

  const scrollBarWidth = 6;

  const topBarHeight = 48;
  const bottomBarHeight = 29;
  const space = 12;

  const tokenInfoBarHeight = 54;

  const marketsWidth = collapsed ? 70 : 280;
  const orderEntryMinWidth = 280;
  const orderEntryMaxWidth = 360;

  const orderbookMinWidth = 280;
  const orderbookMaxWidth = 732;

  const orderbookMinHeight = 464;
  const orderbookMaxHeight = 728;

  const tradindviewMinHeight = 320;
  const tradindviewMaxHeight = 600;

  const tradingViewMinWidth = 540;
  const dataListMinHeight = canTrade ? 379 : 277;

  const minScreenHeight =
    topBarHeight +
    bottomBarHeight +
    tokenInfoBarHeight +
    orderbookMinHeight +
    dataListMinHeight +
    space * 4;

  const minScreenHeightSM =
    topBarHeight +
    bottomBarHeight +
    tokenInfoBarHeight +
    tradindviewMinHeight +
    orderbookMinHeight +
    dataListMinHeight +
    space * 4;

  const marketsWidget = (
    <SideMarketsWidget
      collapsable={collapsable}
      collapsed={collapsed}
      onCollapse={onCollapse}
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
      onTransitionEnd={() => {
        setAnimating(false);
      }}
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
        minHeight: tokenInfoBarHeight,
        height: tokenInfoBarHeight,
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
      p={3}
      style={{ height: dataListSplitSize, minHeight: dataListMinHeight }}
      className="oui-overflow-hidden"
    >
      {dataListWidget}
    </Box>
  );

  const assetsOrderEntryMargin = [
    <RemovablePanel
      key="assets"
      className="oui-border oui-border-line-12"
      index={positions.findIndex((item) => item === 0)}
      onLayout={updatePositions}
      showIndicator={showPositionIcon}
    >
      <AssetViewWidget />
    </RemovablePanel>,
    <RemovablePanel
      key="orderEntry"
      index={positions.findIndex((item) => item === 1)}
      onLayout={updatePositions}
      showIndicator={showPositionIcon}
    >
      <OrderEntryWidget symbol={props.symbol} />
    </RemovablePanel>,
    <RemovablePanel
      key="margin"
      index={positions.findIndex((item) => item === 2)}
      onLayout={updatePositions}
      showIndicator={showPositionIcon}
    >
      <RiskRateWidget />
    </RemovablePanel>,
  ];

  const orderEntryWidget = positions.map(
    (index) => assetsOrderEntryMargin[index]
  );

  const orderEntryView = (
    <Flex
      gapY={3}
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
          gap={3}
          className="oui-flex-1 oui-overflow-hidden"
          style={{
            minWidth: marketsWidth + tradingViewMinWidth + space,
          }}
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
          gapX={3}
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
      gap={3}
      style={{
        minWidth: max4XL
          ? marketsWidth + tradingViewMinWidth + orderbookMinWidth + space * 2
          : tradingViewMinWidth + orderbookMinWidth + space,
      }}
    >
      {symbolInfoBarView}
      <SplitLayout
        className="oui-w-full !oui-h-[calc(100%_-_54px_-_12px)]"
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
        style={{
          minHeight: minScreenHeightSM,
          minWidth: 1024 - scrollBarWidth,
        }}
        className={cn(
          "oui-flex oui-flex-1 oui-overflow-hidden",
          "oui-min-w-[1018px] oui-h-full oui-w-full",
          "oui-p-3",
          props.className
        )}
        onSizeChange={setDataListSplitHeightSM}
        mode="vertical"
      >
        <Flex
          gapX={3}
          itemAlign="stretch"
          className={cn(
            "oui-flex-1",
            layout === "left" && "oui-flex-row-reverse"
          )}
          style={{
            minHeight: Math.max(
              tokenInfoBarHeight +
                tradindviewMinHeight +
                orderbookMinHeight +
                space * 2,
              props.orderEntryHeight
            ),
            maxHeight:
              tokenInfoBarHeight +
              tradindviewMaxHeight +
              orderbookMaxHeight +
              space * 2,
          }}
        >
          <Flex
            height="100%"
            className="oui-flex-1 oui-w-[calc(100%_-_280px_-_12px)]"
            direction="column"
            gapY={3}
          >
            {symbolInfoBarView}
            <Flex
              width="100%"
              height="100%"
              gapX={3}
              itemAlign="stretch"
              style={{
                minHeight: tradindviewMinHeight + orderbookMinHeight + space,
                maxHeight: tradindviewMaxHeight + orderbookMaxHeight + space,
              }}
              className={cn(
                "oui-flex-1",
                layout === "left" && "oui-flex-row-reverse"
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
                mode="vertical"
                style={{
                  width: `calc(100% - ${marketsWidth}px)`,
                }}
                className="oui-flex-1"
                onSizeChange={setOrderbookSplitHeightSM}
              >
                <Box
                  width="100%"
                  intensity={900}
                  r="2xl"
                  style={{
                    minHeight: tradindviewMinHeight,
                    maxHeight: tradindviewMaxHeight,
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
            gapY={3}
            direction="column"
            style={{
              width: orderEntryMinWidth,
              // force order entry render actual content height
              height: "max-content",
            }}
          >
            {orderEntryWidget}
          </Flex>
        </Flex>

        <Box
          intensity={900}
          r="2xl"
          p={3}
          style={{
            height: dataListSplitHeightSM,
            minHeight: dataListMinHeight,
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
        layout === "left" && "oui-flex-row-reverse"
      )}
      width="100%"
      p={3}
      gap={3}
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
