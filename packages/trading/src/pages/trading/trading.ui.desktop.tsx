import { FC, useMemo } from "react";
import { Box, cn, Flex } from "@orderly.network/ui";
import { getOffsetSizeNum, TradingState } from "./trading.script";
import { DataListWidget } from "../../components/desktop/dataList";
import { TradingviewWidget } from "@orderly.network/ui-tradingview";
import { AssetViewWidget } from "../../components/desktop/assetView";
import { RiskRateWidget } from "../../components/desktop/riskRate";
import { OrderBookAndTradesWidget } from "../../components/desktop/orderBookAndTrades";
import {
  SideMarketsWidget,
  TokenInfoBarFullWidget,
} from "@orderly.network/markets";
import { SwitchLayout } from "../../components/desktop/layout/switchLayout";
import { SplitLayout } from "../../components/desktop/layout/splitLayout";
import { RemovablePanel } from "../../components/desktop/layout/removablePanel";
import { OrderEntryWidget } from "@orderly.network/ui-order-entry";

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
    is4XL,
    animating,
    setAnimating,
    positions,
    updatePositions,
    canTrading,
    showPositionIcon,
  } = props;

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

  const tradingViewMinWidth = 540;
  const dataListMinHeight = canTrading ? 379 : 277;

  const minScreenHeight =
    topBarHeight +
    bottomBarHeight +
    tokenInfoBarHeight +
    orderbookMinHeight +
    dataListMinHeight +
    space * 4;

  // const minScreenWidth =
  //   marketsWidth +
  //   tradingViewMinWidth +
  //   orderbookMinWidth +
  //   orderEntryMinWidth +
  //   5 * space;
  // const minScreenWidth = 1440;

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
      {!animating && (
        <SideMarketsWidget
          collapsable={collapsable}
          collapsed={collapsed}
          onCollapse={onCollapse}
          symbol={props.symbol}
          onSymbolChange={props.onSymbolChange}
        />
      )}
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

  const orderEntryView = (
    <Flex
      gapY={3}
      direction="column"
      height="100%"
      style={{
        minWidth: orderEntryMinWidth,
        maxWidth: orderEntryMaxWidth,
        width: mainSplitSize,
      }}
    >
      {positions.map((index) => assetsOrderEntryMargin[index])}
    </Flex>
  );

  const trailing = useMemo(() => {
    return <SwitchLayout layout={layout} onLayout={onLayout} />;
  }, [layout, onLayout]);

  const tokenInfoBarView = (
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
      <TokenInfoBarFullWidget
        symbol={props.symbol}
        onSymbolChange={props.onSymbolChange}
        trailing={trailing}
      />
    </Box>
  );

  const { library_path, ...restTradingViewConfig } = props.tradingViewConfig;

  const tradingView = (
    <Box
      width="100%"
      height="100%"
      intensity={900}
      r="2xl"
      style={{ flex: 1, minWidth: tradingViewMinWidth }}
      className="oui-overflow-hidden"
    >
      <TradingviewWidget
        symbol={props.symbol}
        {...restTradingViewConfig}
        libraryPath={library_path}
      />
    </Box>
  );

  const orderbookView = (
    <Box
      intensity={900}
      r="2xl"
      height="100%"
      style={{
        minWidth: orderbookMinWidth,
        maxWidth: orderbookMaxWidth,
        width: orderBookSplitSize,
      }}
      className="oui-overflow-hidden"
    >
      <OrderBookAndTradesWidget
        symbol={props.symbol}
        tabletMediaQuery={props.tabletMediaQuery}
      />
    </Box>
  );

  const dataListView = (
    <Box
      intensity={900}
      r="2xl"
      p={3}
      style={{ height: dataListSplitSize, minHeight: dataListMinHeight }}
      className="oui-overflow-hidden"
    >
      <DataListWidget
        current={undefined}
        tabletMediaQuery={props.tabletMediaQuery}
        symbol={props.symbol}
        sharePnLConfig={props.sharePnLConfig}
      />
    </Box>
  );

  const renderTradingView = () => {
    if (is4XL && layout === "right") {
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
    >
      {renderTradingView()}
      {orderbookView}
    </SplitLayout>
  );

  const renderTradingViewAndOrderbookView = () => {
    if (is4XL && layout === "left") {
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
        minWidth: is4XL
          ? marketsWidth + tradingViewMinWidth + orderbookMinWidth + space * 2
          : tradingViewMinWidth + orderbookMinWidth + space,
      }}
    >
      {tokenInfoBarView}
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

  return (
    <Flex
      style={{
        minHeight: minScreenHeight,
        // minWidth: minScreenWidth,
      }}
      className={cn("oui-min-w-[1440px]", props.className)}
      width="100%"
      p={3}
      gap={3}
    >
      {!is4XL && layout === "right" && marketsView}
      <SplitLayout
        className="oui-flex oui-flex-1 oui-overflow-hidden"
        onSizeChange={onSizeChange}
      >
        {layout === "left" && orderEntryView}
        {mainView}
        {layout === "right" && orderEntryView}
      </SplitLayout>
      {!is4XL && layout === "left" && marketsView}
    </Flex>
  );
};
