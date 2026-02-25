/**
 * Minimal desktop layout: builds panel registry and renders LayoutHost.
 * Chrome (markets, DnD, Flex) is provided by layout plugins (e.g. layout-split).
 */
import React, { useEffect, useMemo } from "react";
import {
  useGetRwaSymbolOpenStatus,
  useLocalStorage,
} from "@orderly.network/hooks";
import type { LayoutModel, LayoutStrategy } from "@orderly.network/layout-core";
import { LayoutHost } from "@orderly.network/layout-core";
import { API } from "@orderly.network/types";
import { Box, cn } from "@orderly.network/ui";
import { OrderEntryWidget } from "@orderly.network/ui-order-entry";
import { DepositStatusWidget } from "@orderly.network/ui-transfer";
import {
  createTradingPanelRegistry,
  type TradingPanelRegistryProps,
} from "../../components/desktop/layout/TradingPanelRegistry";
import { showRwaOutsideMarketHoursNotify } from "../../components/desktop/notify/rwaNotification";
import { useShowRwaCountdown } from "../../hooks/useShowRwaCountdown";
import { useTradingPageContext } from "../../provider/tradingPageContext";
import type { DesktopLayoutInitialOptions } from "../../types/types";
import { dataListInitialHeight, TradingState } from "./trading.script";
import {
  scrollBarWidth,
  topBarHeight,
  bottomBarHeight,
  space,
  orderbookMinHeight,
  orderbookMaxHeight,
  tradindviewMinHeight,
} from "./trading.script";

const LazyRiskRateWidget = React.lazy(() =>
  import("../../components/desktop/riskRate").then((mod) => ({
    default: mod.RiskRateWidget,
  })),
);
const LazyAssetViewWidget = React.lazy(() =>
  import("../../components/desktop/assetView").then((mod) => ({
    default: mod.AssetViewWidget,
  })),
);

export type DesktopLayoutProps = TradingState & {
  className?: string;
  /** Injected by layout plugin interceptor when not provided by host */
  layoutStrategy?: LayoutStrategy;
  getInitialLayout?: (
    options: DesktopLayoutInitialOptions,
  ) => LayoutModel | undefined;
};

/**
 * Desktop layout core: defines panels and renders LayoutHost.
 * Strategy and initial layout come from context (injected by host or layout plugin).
 */
export const DesktopLayout: React.FC<DesktopLayoutProps> = (props) => {
  const {
    resizeable,
    panelSize,
    onPanelSizeChange,
    layout,
    onLayout,
    marketLayout,
    onMarketLayout,
    orderBookSplitSize,
    dataListSplitSize,
    mainSplitSize,
    max2XL,
    showPositionIcon,
    horizontalDraggable,
    marketsWidth,
    dataListMinHeight,
    sortableItems,
    animating,
    setAnimating,
    tradingViewFullScreen,
  } = props;

  const { showCountdown, closeCountdown } = useShowRwaCountdown(props.symbol);
  const symbolInfoBarHeight = useMemo(
    () => (showCountdown ? 104 : 56),
    [showCountdown],
  );

  const { isRwa, open } = useGetRwaSymbolOpenStatus(props.symbol);
  useEffect(() => {
    if (isRwa && !open) {
      showRwaOutsideMarketHoursNotify();
    }
  }, [isRwa, open, props.symbol]);

  const minScreenHeight = useMemo(
    () =>
      tradingViewFullScreen
        ? 0
        : symbolInfoBarHeight +
          orderbookMaxHeight +
          dataListInitialHeight +
          space * 4,
    [tradingViewFullScreen, symbolInfoBarHeight],
  );

  const minScreenHeightSM =
    topBarHeight +
    bottomBarHeight +
    symbolInfoBarHeight +
    tradindviewMinHeight +
    orderbookMinHeight +
    dataListMinHeight +
    space * 4;

  const orderInteractionWidgets = useMemo(
    () => ({
      margin: {
        className: "",
        element: (
          <React.Suspense fallback={null}>
            <LazyRiskRateWidget />
          </React.Suspense>
        ),
      },
      assets: {
        className: "oui-border oui-border-line-12",
        element: (
          <>
            <React.Suspense fallback={null}>
              <LazyAssetViewWidget
                isFirstTimeDeposit={props.isFirstTimeDeposit}
              />
            </React.Suspense>
            <DepositStatusWidget
              className="oui-mt-3 oui-gap-y-2"
              onClick={props.navigateToPortfolio}
            />
          </>
        ),
      },
      orderEntry: {
        className: "",
        element: (
          <OrderEntryWidget
            symbol={props.symbol}
            disableFeatures={
              props.disableFeatures as
                | ("slippageSetting" | "feesInfo")[]
                | undefined
            }
          />
        ),
      },
    }),
    [
      props.isFirstTimeDeposit,
      props.disableFeatures,
      props.navigateToPortfolio,
      props.symbol,
    ],
  );

  const registryProps = useMemo<TradingPanelRegistryProps>(
    () => ({
      symbol: props.symbol,
      onSymbolChange: (sym: unknown) =>
        props.onSymbolChange?.(sym as API.Symbol),
      tradingViewConfig: props.tradingViewConfig,
      disableFeatures: props.disableFeatures,
      navigateToPortfolio: props.navigateToPortfolio,
      sharePnLConfig: props.sharePnLConfig,
      isFirstTimeDeposit: props.isFirstTimeDeposit,
      resizeable,
      panelSize,
      onPanelSizeChange,
      layout,
      onLayout,
      marketLayout,
      onMarketLayout,
      symbolInfoBarHeight,
      showCountdown: showCountdown ?? false,
      closeCountdown,
      showPositionIcon,
      tradingViewFullScreen,
      horizontalDraggable,
      orderBookSplitSize,
      dataListSplitSize,
      mainSplitSize,
      marketsWidth,
      animating,
      setAnimating,
      sortableItems,
      orderInteractionWidgets,
    }),
    [
      props.symbol,
      props.onSymbolChange,
      props.tradingViewConfig,
      props.disableFeatures,
      props.navigateToPortfolio,
      props.sharePnLConfig,
      props.isFirstTimeDeposit,
      resizeable,
      panelSize,
      onPanelSizeChange,
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
      marketsWidth,
      animating,
      setAnimating,
      sortableItems,
      orderInteractionWidgets,
    ],
  );

  const panels = useMemo(
    () => createTradingPanelRegistry(registryProps),
    [registryProps],
  );

  const contextLayout = useTradingPageContext();
  /** Prefer props (injected by layout plugin interceptor) over context */
  const layoutStrategy = props.layoutStrategy ?? contextLayout.layoutStrategy;
  const getInitialLayout =
    props.getInitialLayout ?? contextLayout.getInitialLayout;
  const panelIds = useMemo(() => Array.from(panels.keys()), [panels]);

  const initialLayout = useMemo(() => {
    if (getInitialLayout) {
      return getInitialLayout({
        variant: max2XL ? "max2XL" : "default",
        layoutSide: layout,
        mainSplitSize,
        orderBookSplitSize,
        dataListSplitSize,
      });
    }
    if (layoutStrategy) {
      return layoutStrategy.defaultLayout(panelIds);
    }
    return undefined;
  }, [
    getInitialLayout,
    layoutStrategy,
    max2XL,
    layout,
    mainSplitSize,
    orderBookSplitSize,
    dataListSplitSize,
    panelIds,
  ]);

  const layoutStorageKey = max2XL
    ? "orderly_trading_desktop_layout_sm"
    : "orderly_trading_desktop_layout";

  const defaultLayoutHostClassName = cn(
    "oui-flex oui-flex-1 oui-overflow-hidden",
    max2XL && "oui-size-full oui-min-w-[1018px] oui-px-3 oui-py-2",
  );
  const defaultLayoutHostStyle = max2XL
    ? {
        minHeight: minScreenHeightSM,
        minWidth: 1024 - scrollBarWidth,
      }
    : { flex: 1, minHeight: minScreenHeight };

  if (!layoutStrategy) {
    return (
      <div
        className={cn(defaultLayoutHostClassName, props.className)}
        style={defaultLayoutHostStyle}
      >
        <div className="oui-flex oui-flex-1 oui-items-center oui-justify-center oui-text-base-4">
          Desktop layout requires layoutStrategy (e.g. split or grid) from the
          consumer.
        </div>
      </div>
    );
  }

  return (
    <Box
      className={cn(defaultLayoutHostClassName, props.className)}
      style={defaultLayoutHostStyle}
    >
      <LayoutHost
        strategy={layoutStrategy}
        panels={panels}
        initialLayout={initialLayout}
        storageKey={layoutStorageKey}
        className="oui-flex oui-flex-1 oui-overflow-hidden"
        style={{ flex: 1, minHeight: 0 }}
      />
    </Box>
  );
};
