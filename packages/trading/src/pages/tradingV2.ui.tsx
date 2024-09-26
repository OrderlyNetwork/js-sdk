import { FC, PropsWithChildren, ReactNode, useMemo, useState } from "react";
import { Box, cn, Flex, ScrollArea } from "@orderly.network/ui";
import { TradingV2State } from "./tradingV2.script";
import { DataListWidget } from "../components/desktop/dataList";
import { TradingviewWidget } from "@orderly.network/ui-tradingview";
import { AssetViewWidget } from "../components/desktop/assetView";
import { RiskRateWidget } from "../components/desktop/riskRate";
import { useLocalStorage, useMediaQuery } from "@orderly.network/hooks";
import { MEDIA_TABLET } from "@orderly.network/types";
import { NavBarWidget } from "../components/mWeb/navBar";
import { TopTabWidget } from "../components/mWeb/topTab";
import { OrderBookAndEntryWidget } from "../components/mWeb/orderBookAndEntry";
import { BottomTabWidget } from "../components/mWeb/bottomTab";
import { OrderBookAndTradesWidget } from "../components/desktop/orderBookAndTrades";
import {
  SideMarketsWidget,
  TokenInfoBarWidget,
} from "@orderly.network/markets";
import { LayoutSwitch } from "../components/desktop/layoutSwitch";
// import Split from "@uiw/react-split";

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
      <NavBarWidget className="oui-mx-1 oui-bg-base-9 oui-rounded-xl"/>
      <TopTabWidget className="oui-mx-1 oui-bg-base-9 oui-rounded-xl"/>
      <OrderBookAndEntryWidget className="oui-mx-1 oui-bg-base-9 oui-rounded-xl"/>
      <BottomTabWidget className="oui-mx-1 oui-bg-base-9 oui-rounded-xl oui-p-2"/>
    </div>
  );
};

const DesktopLayout: FC<TradingV2State> = (props) => {
  const [collapsed, setCollapsed] = useLocalStorage(
    "orderly_side_markets_collapsed",
    false
  );

  // Order entry and side market list position, default Order entry in right
  const [layout, setLayout] = useLocalStorage(
    "orderly_order_entry_side_markets_layout",
    "right"
  );

  const { view, width } = useMemo(() => {
    const marketsWidth = collapsed ? 70 : 280;
    const orderEntryWidth = 280;

    const marketsView = (
      <Box intensity={900} pt={3} r="2xl" height="100%">
        <SideMarketsWidget
          collapsed={collapsed}
          onCollapse={setCollapsed}
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

    let view: { left: ReactNode; right: ReactNode };
    let width: { left: number; right: number };

    if (layout === "left") {
      view = { left: orderEntryView, right: marketsView };
      width = { left: orderEntryWidth, right: marketsWidth };
    } else {
      view = { left: marketsView, right: orderEntryView };
      width = { left: marketsWidth, right: orderEntryWidth };
    }

    return { view, width };
  }, [collapsed, layout]);

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
      <div
        className={cn(
          "oui-grid oui-grid-cols-1 oui-gap-3",
          "oui-overflow-hidden"
        )}
      >
        <Box height={54} intensity={900} r="2xl" px={3}>
          <TokenInfoBarWidget
            symbol={props.symbol}
            onSymbolChange={props.onSymbolChange}
            trailing={<LayoutSwitch layout={layout} onLayout={setLayout} />}
            height={54}
          />
        </Box>

        <Flex gapX={3}>
          <Box
            className="oui-flex-1"
            width={"100%"}
            height={"100%"}
            intensity={900}
            r="2xl"
          >
            <TradingviewWidget
              symbol={props.symbol}
              libraryPath={props.tradingViewConfig?.library_path}
              scriptSRC={props.tradingViewConfig?.scriptSRC}
              customCssUrl={props.tradingViewConfig?.customCssUrl}
            />
          </Box>
          <Box className="oui-flex-1" width={"100%"} height={"100%"}>
            <OrderBookAndTradesWidget symbol={props.symbol} tabletMediaQuery={props.tabletMediaQuery}/>
          </Box>
        </Flex>

        <Box intensity={900} r="2xl" p={3}>
          <DataListWidget {...props.dataList} />
        </Box>
      </div>
      <div>{view.right}</div>
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
