import { FC, PropsWithChildren } from "react";
import { Box, Flex } from "@orderly.network/ui";
import { getOffsetSizeNum, TradingV2State } from "./tradingV2.script";
import { DataListWidget } from "../components/desktop/dataList";
import { TradingviewWidget } from "@orderly.network/ui-tradingview";
import { AssetViewWidget } from "../components/desktop/assetView";
import { RiskRateWidget } from "../components/desktop/riskRate";
import { useMediaQuery } from "@orderly.network/hooks";
import { NavBarWidget } from "../components/mWeb/navBar";
import { TopTabWidget } from "../components/mWeb/topTab";
import { OrderBookAndEntryWidget } from "../components/mWeb/orderBookAndEntry";
import { BottomTabWidget } from "../components/mWeb/bottomTab";
import { OrderBookAndTradesWidget } from "../components/desktop/orderBookAndTrades";
import {
  SideMarketsWidget,
  TokenInfoBarWidget,
} from "@orderly.network/markets";
import { LayoutSwitch } from "../components/desktop/layout/layoutSwitch";
import SplitLayout from "../components/desktop/layout/splitLayout";

export const TradingV2: FC<TradingV2State> = (props) => {
  const isMobileLayout = useMediaQuery(props.tabletMediaQuery);

  return isMobileLayout ? (
    <MobileLayout {...props} />
  ) : (
    <DesktopLayout {...props} />
  );
};

const MobileLayout: FC<TradingV2State> = (props) => {
  return (
    <div className="oui-h-100% oui-overflow-auto oui-hide-scrollbar oui-space-y-1">
      <NavBarWidget className="oui-mx-1 oui-bg-base-9 oui-rounded-xl" />
      <TopTabWidget className="oui-mx-1 oui-bg-base-9 oui-rounded-xl" />
      <OrderBookAndEntryWidget className="oui-mx-1 oui-bg-base-9 oui-rounded-xl" />
      <BottomTabWidget
        symbol={props.symbol}
        className="oui-mx-1 oui-bg-base-9 oui-rounded-xl oui-p-2"
        config={props.dataList.config}
      />
    </div>
  );
};

const DesktopLayout: FC<TradingV2State> = (props) => {
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
  } = props;

  const marketsWidth = collapsed ? 70 : 280;

  const marketsView = (
    <Box
      intensity={900}
      pt={3}
      r="2xl"
      height="100%"
      width={marketsWidth}
      style={{ minWidth: marketsWidth }}
      className="oui-transition-all oui-duration-300"
    >
      <SideMarketsWidget
        collapsed={collapsed}
        onCollapse={onCollapse}
        onSymbolChange={props.onSymbolChange}
      />
    </Box>
  );

  const orderEntryView = (
    <Flex
      gapY={3}
      direction="column"
      style={{
        minWidth: "280px",
        maxWidth: "500px",
        width: mainSplitSize,
      }}
      height="100%"
    >
      <Box className="oui-bg-base-9 oui-rounded-2xl oui-p-3 oui-space-y-8 oui-w-full">
        <AssetViewWidget />
      </Box>
      <Box className="oui-bg-base-9 oui-rounded-2xl oui-p-3 oui-space-y-8 oui-w-full">
        <RiskRateWidget />
      </Box>
    </Flex>
  );

  const tokenInfoBarView = (
    <Box height={54} intensity={900} r="2xl" px={3} width="100%">
      <TokenInfoBarWidget
        symbol={props.symbol}
        onSymbolChange={props.onSymbolChange}
        trailing={<LayoutSwitch layout={layout} onLayout={onLayout} />}
        height={54}
      />
    </Box>
  );

  const tradingView = (
    <Box
      width="100%"
      height="100%"
      intensity={900}
      r="2xl"
      style={{ flex: 1, minWidth: "468px" }}
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
        minWidth: "280px",
        maxWidth: "800px",
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
      style={{ height: dataListSplitSize, minHeight: "350px" }}
    >
      <DataListWidget
        {...props.dataList}
        tabletMediaQuery={props.tabletMediaQuery}
      />
    </Box>
  );

  const renderTradingView = () => {
    if (isMedium && layout === "right") {
      return (
        <Flex
          gap={3}
          className="oui-flex-1"
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
        minHeight: "450px",
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
            minHeight: "450px",
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
        minWidth: "calc(100% - 500px)",
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
    <Container>
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
    </Container>
  );
};

export const Container: React.FC<PropsWithChildren<{}>> = (props) => {
  return (
    <Flex
      className="oui-h-[calc(100vh_-_49px_-_29px)] oui-bg-base-10"
      width="100%"
      p={3}
      gap={3}
    >
      {props.children}
    </Flex>
  );
};
