/**
 * Trading panel registry: builds PanelRegistry from trading state for strategy-based layout.
 * Widget creation logic is centralized here so layout (LayoutHost) stays decoupled from content.
 */
import React from "react";
import {
  type PanelRegistry,
  TRADING_PANEL_IDS,
} from "@orderly.network/layout-core";
import {
  SideMarketsWidget,
  SymbolInfoBarFullWidget,
} from "@orderly.network/markets";
import { cn } from "@orderly.network/ui";
import { OrderEntryWidget } from "@orderly.network/ui-order-entry";
import type { SharePnLConfig } from "@orderly.network/ui-share";
import { TradingviewWidget } from "@orderly.network/ui-tradingview";
import { DepositStatusWidget } from "@orderly.network/ui-transfer";
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
const LazyRiskRateWidget = React.lazy(() =>
  import("../riskRate").then((mod) => ({
    default: mod.RiskRateWidget,
  })),
);
const LazyAssetViewWidget = React.lazy(() =>
  import("../assetView").then((mod) => ({
    default: mod.AssetViewWidget,
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
  sharePnLConfig?: SharePnLConfig;
  isFirstTimeDeposit?: boolean;
  resizeable?: boolean;
  panelSize?: "small" | "middle" | "large";
  onPanelSizeChange?: (size: "small" | "middle" | "large") => void;
  /** Optional when layout is rule-driven; defaults used for SwitchLayout when undefined. */
  layout?: LayoutPosition;
  onLayout?: (layout: LayoutPosition) => void;
  marketLayout?: "left" | "top" | "bottom" | "hide";
  onMarketLayout?: (layout: "left" | "top" | "bottom" | "hide") => void;
  /** Computed: symbol bar height (e.g. 104 with countdown, 56 without) */
  symbolInfoBarHeight: number;
  showCountdown: boolean;
  closeCountdown: () => void;
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
}

/**
 * Creates a PanelRegistry (Map<panelId, ReactNode>) for the trading desktop layout.
 * Call from DesktopLayout with full state + computed values; use result as LayoutHost panels.
 */
export function createTradingPanelRegistry(
  props: TradingPanelRegistryProps,
): PanelRegistry {
  const layoutResolved = props.layout ?? "right";
  const marketLayoutResolved = props.marketLayout ?? "left";
  const onLayoutResolved = props.onLayout ?? (() => {});
  const onMarketLayoutResolved = props.onMarketLayout ?? (() => {});

  const {
    symbol,
    onSymbolChange,
    tradingViewConfig,
    showCountdown,
    closeCountdown,
    tradingViewFullScreen,
    resizeable,
    panelSize,
    onPanelSizeChange,
    sharePnLConfig,
    animating,
    setAnimating,
  } = props;
  const layout = layoutResolved;
  const onLayout = onLayoutResolved;
  const marketLayout = marketLayoutResolved;
  const onMarketLayout = onMarketLayoutResolved;

  const config = (tradingViewConfig ?? {}) as {
    library_path?: string;
    [key: string]: unknown;
  };
  const { library_path, ...restTradingViewConfig } = config;

  const panels = new Map<string, React.ReactNode>();

  // symbolInfoBar
  panels.set(
    TRADING_PANEL_IDS.SYMBOL_INFO_BAR,
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
    />,
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
  panels.set(TRADING_PANEL_IDS.TRADING_VIEW, tradingviewWidget);

  // orderbook
  panels.set(
    TRADING_PANEL_IDS.ORDERBOOK,
    <React.Suspense fallback={null}>
      <LazyOrderBookAndTradesWidget symbol={symbol} />
    </React.Suspense>,
  );

  // dataList
  panels.set(
    TRADING_PANEL_IDS.DATA_LIST,
    <React.Suspense fallback={null}>
      <LazyDataListWidget
        current={undefined}
        symbol={symbol}
        sharePnLConfig={sharePnLConfig}
      />
    </React.Suspense>,
  );

  // order-entry sub panels: margin / assets / main order entry
  panels.set(
    TRADING_PANEL_IDS.MARGIN,
    <React.Suspense fallback={null}>
      <LazyRiskRateWidget />
    </React.Suspense>,
  );

  panels.set(
    TRADING_PANEL_IDS.ASSETS,
    <>
      <React.Suspense fallback={null}>
        <LazyAssetViewWidget isFirstTimeDeposit={props.isFirstTimeDeposit} />
      </React.Suspense>
      <DepositStatusWidget
        className="oui-mt-3 oui-gap-y-2"
        onClick={props.navigateToPortfolio}
      />
    </>,
  );

  panels.set(
    TRADING_PANEL_IDS.MAIN,
    <OrderEntryWidget
      symbol={symbol}
      disableFeatures={
        props.disableFeatures as ("slippageSetting" | "feesInfo")[] | undefined
      }
    />,
  );

  // markets: always register; layout plugin decides whether to show (e.g. include in layout model)
  const marketsWidget = (
    <SideMarketsWidget
      resizeable={resizeable}
      panelSize={panelSize as "small" | "middle" | "large"}
      onPanelSizeChange={
        onPanelSizeChange as unknown as React.Dispatch<
          React.SetStateAction<"small" | "middle" | "large">
        >
      }
      symbol={symbol}
      onSymbolChange={onSymbolChange}
    />
  );
  panels.set(
    TRADING_PANEL_IDS.MARKETS,
    <div onTransitionEnd={() => setAnimating?.(false)}>
      {!animating && marketsWidget}
    </div>,
  );

  return panels;
}
