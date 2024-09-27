import { FC, PropsWithChildren, useMemo } from "react";
import { Box, cn, Flex } from "@orderly.network/ui";
import { TradingV2State } from "./tradingV2.script";
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
import Split from "@uiw/react-split";
import SplitLineBar from "../components/desktop/layout/splitLineBar";

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
  } = props;

  const { view, width } = useMemo(() => {
    const marketsWidth = collapsed ? 70 : 280;
    const orderEntryWidth = 280;

    const marketsView = (
      <Box intensity={900} pt={3} r="2xl" height="100%">
        <SideMarketsWidget
          collapsed={collapsed}
          onCollapse={onCollapse}
          onSymbolChange={props.onSymbolChange}
          width={marketsWidth}
        />
      </Box>
    );

    const orderEntryView = (
      <Flex gapY={3} direction="column">
        <Box className="oui-bg-base-9 oui-rounded-2xl oui-p-3 oui-space-y-8 oui-w-full">
          <AssetViewWidget />
        </Box>
        <Box className="oui-bg-base-9 oui-rounded-2xl oui-p-3 oui-space-y-8 oui-w-full">
          <RiskRateWidget />
        </Box>
      </Flex>
    );

    if (layout === "left") {
      return {
        view: { left: orderEntryView, right: marketsView },
        width: { left: orderEntryWidth, right: marketsWidth },
      };
    } else {
      return {
        view: { left: marketsView, right: orderEntryView },
        width: { left: marketsWidth, right: orderEntryWidth },
      };
    }
  }, [collapsed, layout]);

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
        minWidth: "300px",
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

  return (
    <div
      style={{
        gridTemplateColumns: `${width.left}px 1fr ${width.right}px`,
      }}
      className={cn(
        "oui-grid oui-grid-rows-1 oui-h-[calc(100vh_-_49px_-_29px)]",
        "oui-p-3 oui-gap-3 oui-bg-base-10",
        "oui-transition-all"
      )}
    >
      <div className="oui-h-full">{view.left}</div>

      <Flex
        width="100%"
        direction="column"
        className={cn("oui-gap-3", "oui-overflow-hidden")}
      >
        {tokenInfoBarView}
        {/* @ts-ignore */}
        <Split
          className="oui-h-full oui-w-full"
          lineBar
          renderBar={(props: any) => (
            <SplitLineBar {...props} mode="vertical" />
          )}
          mode="vertical"
          onDragEnd={(_, width, num) => {
            setDataListSplitSize(`${width}`);
          }}
        >
          {/* @ts-ignore */}
          <Split
            style={{
              flex: 1,
              minHeight: "450px",
            }}
            lineBar
            renderBar={(props: any) => <SplitLineBar {...props} />}
            onDragEnd={(_, width, num) => {
              setOrderbookSplitSize(`${width}`);
            }}
          >
            {tradingView}
            {orderbookView}
          </Split>

          {dataListView}
        </Split>
      </Flex>

      <div className="oui-h-full">{view.right}</div>
    </div>
  );
};

export const Container: React.FC<PropsWithChildren<{}>> = (props) => {
  return (
    <Box intensity={900} r="2xl">
      {props.children}
    </Box>
  );
};
