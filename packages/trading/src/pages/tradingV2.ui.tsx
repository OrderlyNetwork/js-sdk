import { FC, ReactNode, useMemo, useState } from "react";
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

export const TradingV2: FC<TradingV2State> = (props) => {
  const isMobileLayout = useMediaQuery(MEDIA_TABLET);

  return isMobileLayout ? (
    <MobileLayout {...props} />
  ) : (
    <DesktopLayout {...props} />
  );
};

const MobileLayout: FC<TradingV2State> = (props) => {
  return (
    <ScrollArea className="oui-h-100%">
      <NavBarWidget />
      <TopTabWidget />
      <OrderBookAndEntryWidget />
      <BottomTabWidget />
    </ScrollArea>
  );
};

const DesktopLayout: FC<TradingV2State> = (props) => {
  const [collapsed, setCollapsed] = useLocalStorage(
    "orderly_side_markets_collapsed",
    false
  );
  // Order entry <> side market list
  const [layout, setLayout] = useLocalStorage(
    "orderly_order_entry_side_markets_layout",
    "right"
  );

  const { view, width } = useMemo(() => {
    const marketsView = (
      <SideMarketsWidget collapsed={collapsed} onCollapse={setCollapsed} />
    );
    const orderEntryView = (
      <>
        <Box className="oui-bg-base-9 oui-rounded-2xl oui-p-3 oui-space-y-8 oui-w-full">
          <AssetViewWidget />
        </Box>
        <Box className="oui-bg-base-9 oui-rounded-2xl oui-p-3 oui-space-y-8 oui-w-full">
          <RiskRateWidget />
        </Box>
      </>
    );
    const marketsWidth = collapsed ? 70 : 280;
    const orderEntryWidth = 280;
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
        <TokenInfoBarWidget
          symbol={props.symbol}
          layout={layout}
          onLayout={setLayout}
        />

        <Flex gapX={3}>
          <Box className="oui-flex-1" width={"100%"} height={"100%"}>
            <TradingviewWidget
              symbol={props.symbol}
              libraryPath={props.tradingViewConfig?.library_path}
              scriptSRC={props.tradingViewConfig?.scriptSRC}
              customCssUrl={props.tradingViewConfig?.customCssUrl}
            />
          </Box>
          <Box className="oui-flex-1" width={"100%"} height={"100%"}>
            <OrderBookAndTradesWidget symbol={props.symbol} />
          </Box>
        </Flex>

        <Box className="oui-bg-base-9 oui-rounded-2xl oui-p-3">
          <DataListWidget {...props.dataList} />
        </Box>
      </div>
      <div>{view.right}</div>
    </div>
  );
};
