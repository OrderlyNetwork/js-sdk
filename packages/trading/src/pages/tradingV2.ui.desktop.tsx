import { FC } from "react";
import { Box, Flex } from "@orderly.network/ui";
import { getOffsetSizeNum, TradingV2State } from "./tradingV2.script";
import { DataListWidget } from "../components/desktop/dataList";
import { TradingviewWidget } from "@orderly.network/ui-tradingview";
import { AssetViewWidget } from "../components/desktop/assetView";
import { RiskRateWidget } from "../components/desktop/riskRate";
import { OrderBookAndTradesWidget } from "../components/desktop/orderBookAndTrades";
import {
  SideMarketsWidget,
  TokenInfoBarFullWidget,
} from "@orderly.network/markets";
import { LayoutSwitch } from "../components/desktop/layout/layoutSwitch";
import { SplitLayout } from "../components/desktop/layout/splitLayout";
import { OrderEntryWidget } from "@orderly.network/ui-order-entry";

export type DesktopLayoutProps = TradingV2State & {
  className?: string;
};

export const DesktopLayout: FC<DesktopLayoutProps> = (props) => {
  const {
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
    isMedium,
    animating,
    setAnimating,
  } = props;

  const tokenInfoBarHeight = 54;

  const marketsWidth = collapsed ? 70 : 280;
  const orderEntryMinWidth = 280;
  const orderEntryMaxWidth = 360;

  const orderbookMinWidth = 280;
  const orderbookMaxWidth = 732;

  const orderbookMinHeight = 464;
  const orderbookMaxHeight = 728;

  const tradingViewMinWidth = 468;
  const dataListMinHeight = 350;

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
          collapsed={collapsed}
          onCollapse={onCollapse}
          onSymbolChange={props.onSymbolChange}
        />
      )}
    </Box>
  );

  const orderEntryView = (
    <Flex
      gapY={3}
      direction="column"
      style={{
        minWidth: orderEntryMinWidth,
        maxWidth: orderEntryMaxWidth,
        width: mainSplitSize,
      }}
      height="100%"
    >
      <Box className="oui-bg-base-9 oui-rounded-2xl oui-p-3 oui-space-y-8 oui-w-full">
        <AssetViewWidget />
      </Box>
      <Box className="oui-bg-base-9 oui-rounded-2xl oui-p-3 oui-space-y-8 oui-w-full">
        <OrderEntryWidget symbol={props.symbol} />
      </Box>
      <Box className="oui-bg-base-9 oui-rounded-2xl oui-p-3 oui-space-y-8 oui-w-full">
        <RiskRateWidget />
      </Box>
    </Flex>
  );

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
        trailing={<LayoutSwitch layout={layout} onLayout={onLayout} />}
      />
    </Box>
  );

  const tradingView = (
    <Box
      width="100%"
      height="100%"
      intensity={900}
      r="2xl"
      style={{ flex: 1, minWidth: tradingViewMinWidth }}
    >
      <TradingviewWidget
        symbol={props.symbol}
        libraryPath={props.tradingViewConfig?.library_path}
        scriptSRC={props.tradingViewConfig?.scriptSRC}
        customCssUrl={props.tradingViewConfig?.customCssUrl}
      />
    </Box>
  );

  const orderbookView = (
    <Box
      height="100%"
      style={{
        minWidth: orderbookMinWidth,
        maxWidth: orderbookMaxWidth,
        width: orderBookSplitSize,
      }}
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
    >
      <DataListWidget
        current={undefined}
        tabletMediaQuery={props.tabletMediaQuery}
        symbol={props.symbol}

      />
    </Box>
  );

  const renderTradingView = () => {
    if (isMedium && layout === "right") {
      return (
        <Flex
          gap={3}
          className="oui-flex-1 oui-overflow-hidden"
          style={{
            minWidth: 468 + marketsWidth + 12,
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
        maxHeight: orderbookMaxHeight,
      }}
      onSizeChange={setOrderbookSplitSize}
    >
      {renderTradingView()}
      {orderbookView}
    </SplitLayout>
  );

  const renderTradingViewAndOrderbookView = () => {
    if (isMedium && layout === "left") {
      return (
        <Flex
          gapX={3}
          style={{
            minHeight: orderbookMinHeight,
            maxHeight: orderbookMaxHeight,
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
        minWidth: `calc(100% - ${orderEntryMaxWidth}px)`,
      }}
    >
      {tokenInfoBarView}
      <SplitLayout
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

  return (
    <Flex className={props.className} width="100%" p={3} gap={3}>
      {!isMedium && layout === "right" && marketsView}
      <SplitLayout
        className="oui-flex oui-flex-1 oui-overflow-hidden"
        onSizeChange={onSizeChange}
      >
        {layout === "left" && orderEntryView}
        {mainView}
        {layout === "right" && orderEntryView}
      </SplitLayout>
      {!isMedium && layout === "left" && marketsView}
    </Flex>
  );
};
