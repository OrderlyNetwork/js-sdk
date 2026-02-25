/**
 * Trading panel registry: builds PanelRegistry from trading state for strategy-based layout.
 * Widget creation logic is centralized here so layout (LayoutHost) stays decoupled from content.
 */
import React, { type ReactNode } from "react";
import {
  type PanelRegistry,
  TRADING_PANEL_IDS,
} from "@orderly.network/layout-core";
import {
  SideMarketsWidget,
  SymbolInfoBarFullWidget,
} from "@orderly.network/markets";
import { Box, cn, Flex } from "@orderly.network/ui";
import { TradingviewWidget } from "@orderly.network/ui-tradingview";
import { SortablePanel } from "./sortablePanel";
import type { LayoutPosition } from "./switchLayout";

/** Re-export for consumers that import from trading package */
export { TRADING_PANEL_IDS };
export type { TradingPanelId } from "@orderly.network/layout-core";

const LazyDataListWidget = React.lazy(() =>
  import("../dataList").then((mod) => ({ default: mod.DataListWidget })),
);
const LazySwitchLayout = React.lazy(() =>
  import("./switchLayout").then((mod) => ({ default: mod.SwitchLayout })),
);
const LazyOrderBookAndTradesWidget = React.lazy(() =>
  import("../orderBookAndTrades").then((mod) => ({
    default: mod.OrderBookAndTradesWidget,
  })),
);

/**
 * Props required to build the trading panel registry.
 * Extends trading state with computed values from the desktop layout.
 */
export interface TradingPanelRegistryProps {
  symbol: string;
  /** Called when symbol changes; registry passes through to widgets */
  onSymbolChange: (symbol: unknown) => void;
  /** TradingView config; registry uses library_path and spreads rest to widget */
  tradingViewConfig?: unknown;
  disableFeatures?: unknown;
  navigateToPortfolio?: () => void;
  sharePnLConfig?: unknown;
  isFirstTimeDeposit?: boolean;
  resizeable?: boolean;
  panelSize?: "small" | "middle" | "large";
  onPanelSizeChange?: (size: "small" | "middle" | "large") => void;
  layout: LayoutPosition;
  onLayout: (layout: LayoutPosition) => void;
  marketLayout: "left" | "top" | "bottom" | "hide";
  onMarketLayout: (layout: "left" | "top" | "bottom" | "hide") => void;
  /** Computed: symbol bar height (e.g. 104 with countdown, 56 without) */
  symbolInfoBarHeight: number;
  showCountdown: boolean;
  closeCountdown: () => void;
  showPositionIcon: boolean;
  /** TradingView fullscreen from localStorage */
  tradingViewFullScreen: boolean;
  /** Whether horizontal split is draggable (e.g. min-width 1440px) */
  horizontalDraggable?: boolean;
  /** Current split sizes (used for min/max styling only when layout is strategy-driven) */
  orderBookSplitSize?: string;
  dataListSplitSize?: string;
  mainSplitSize?: string;
  marketsWidth?: number;
  animating?: boolean;
  setAnimating?: (v: boolean) => void;
  /** Order-entry sortable keys (e.g. ["margin", "assets", "orderEntry"]) */
  sortableItems: string[];
  /** Map of order-entry sub-widgets (margin, assets, orderEntry) for SortablePanel */
  orderInteractionWidgets: Record<
    string,
    { className: string; element: ReactNode }
  >;
}

/**
 * Creates a PanelRegistry (Map<panelId, ReactNode>) for the trading desktop layout.
 * Call from DesktopLayout with full state + computed values; use result as LayoutHost panels.
 */
export function createTradingPanelRegistry(
  props: TradingPanelRegistryProps,
): PanelRegistry {
  const {
    symbol,
    onSymbolChange,
    tradingViewConfig,
    layout,
    onLayout,
    marketLayout,
    onMarketLayout,
    symbolInfoBarHeight,
    showCountdown,
    closeCountdown,
    showPositionIcon,
    tradingViewFullScreen,
    horizontalDraggable,
    orderBookSplitSize,
    dataListSplitSize,
    mainSplitSize,
    resizeable,
    panelSize,
    onPanelSizeChange,
    sharePnLConfig,
    marketsWidth,
    animating,
    setAnimating,
  } = props;

  const config = (tradingViewConfig ?? {}) as {
    library_path?: string;
    [key: string]: unknown;
  };
  const { library_path, ...restTradingViewConfig } = config;
  const { sortableItems, orderInteractionWidgets } = props;

  const panels = new Map<string, ReactNode>();

  // symbolInfoBar
  panels.set(
    TRADING_PANEL_IDS.SYMBOL_INFO_BAR,
    <Box
      intensity={900}
      r="2xl"
      px={3}
      width="100%"
      style={{ minHeight: symbolInfoBarHeight, height: symbolInfoBarHeight }}
    >
      <SymbolInfoBarFullWidget
        symbol={symbol}
        onSymbolChange={onSymbolChange}
        closeCountdown={closeCountdown}
        showCountdown={showCountdown}
        trailing={
          <React.Suspense fallback={null}>
            <LazySwitchLayout
              layout={layout}
              onLayout={onLayout}
              marketLayout={marketLayout}
              onMarketLayout={onMarketLayout}
            />
          </React.Suspense>
        }
      />
    </Box>,
  );

  // tradingView (chart)
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
      symbol={symbol}
      {...restTradingViewConfig}
      libraryPath={library_path}
    />
  );
  panels.set(
    TRADING_PANEL_IDS.TRADING_VIEW,
    <Box
      width="100%"
      height="100%"
      intensity={900}
      r="2xl"
      style={{ flex: 1, minWidth: 540 }}
      className="oui-overflow-hidden"
    >
      {tradingviewWidget}
    </Box>,
  );

  // orderbook
  panels.set(
    TRADING_PANEL_IDS.ORDERBOOK,
    <Box
      r="2xl"
      height="100%"
      style={{
        minWidth: 280,
        maxWidth: horizontalDraggable ? 732 : 280,
        width: orderBookSplitSize ?? "280px",
      }}
      className="oui-overflow-hidden"
    >
      <React.Suspense fallback={null}>
        <LazyOrderBookAndTradesWidget symbol={symbol} />
      </React.Suspense>
    </Box>,
  );

  // dataList
  panels.set(
    TRADING_PANEL_IDS.DATA_LIST,
    <Box
      intensity={900}
      r="2xl"
      p={2}
      style={{
        height: dataListSplitSize ?? "350px",
        minHeight: 350,
      }}
      className="oui-overflow-hidden"
    >
      <React.Suspense fallback={null}>
        <LazyDataListWidget
          current={undefined}
          symbol={symbol}
          sharePnLConfig={sharePnLConfig}
        />
      </React.Suspense>
    </Box>,
  );

  // orderEntry (SortablePanel list)
  panels.set(
    TRADING_PANEL_IDS.ORDER_ENTRY,
    <Flex
      gapY={2}
      direction="column"
      height="100%"
      style={{
        minWidth: 280,
        maxWidth: horizontalDraggable ? 360 : 280,
        width: mainSplitSize ?? "280px",
      }}
    >
      {sortableItems.map((key: string) => (
        <SortablePanel
          key={key}
          id={key}
          showIndicator={showPositionIcon}
          className={
            orderInteractionWidgets[key as keyof typeof orderInteractionWidgets]
              ?.className ?? ""
          }
        >
          {
            orderInteractionWidgets[key as keyof typeof orderInteractionWidgets]
              ?.element
          }
        </SortablePanel>
      ))}
    </Flex>,
  );

  // markets (optional; register only when side markets are shown)
  if (marketLayout === "left" && resizeable !== false) {
    const marketsWidget = (
      <SideMarketsWidget
        resizeable={resizeable}
        panelSize={panelSize as "small" | "middle" | "large"}
        onPanelSizeChange={
          onPanelSizeChange as (s: "small" | "middle" | "large") => void
        }
        symbol={symbol}
        onSymbolChange={onSymbolChange}
      />
    );
    panels.set(
      TRADING_PANEL_IDS.MARKETS,
      <Box
        intensity={900}
        pt={3}
        r="2xl"
        height="100%"
        width={marketsWidth ?? 280}
        style={{ minWidth: marketsWidth ?? 280 }}
        className="oui-transition-all oui-duration-150"
        onTransitionEnd={() => setAnimating?.(false)}
      >
        {!animating && marketsWidget}
      </Box>,
    );
  }

  return panels;
}
