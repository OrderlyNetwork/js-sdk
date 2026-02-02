import React, { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS, Transform } from "@dnd-kit/utilities";
import {
  useGetRwaSymbolOpenStatus,
  useLocalStorage,
} from "@orderly.network/hooks";
import { LayoutHost } from "@orderly.network/layout-core";
import {
  SideMarketsWidget,
  HorizontalMarketsWidget,
} from "@orderly.network/markets";
import {
  OrderEntrySortKeys,
  TradingviewFullscreenKey,
} from "@orderly.network/types";
import { Box, cn, Flex } from "@orderly.network/ui";
import { OrderEntryWidget } from "@orderly.network/ui-order-entry";
import { DepositStatusWidget } from "@orderly.network/ui-transfer";
import { resolveTradingLayoutStrategy } from "../../components/desktop/layout/TradingLayoutStrategyRegistry";
import {
  createTradingPanelRegistry,
  type TradingPanelRegistryProps,
} from "../../components/desktop/layout/TradingPanelRegistry";
import { SortablePanel } from "../../components/desktop/layout/sortablePanel";
import { createTradingDesktopLayout } from "../../components/desktop/layout/tradingSplitStrategy";
import { showRwaOutsideMarketHoursNotify } from "../../components/desktop/notify/rwaNotification";
import { useShowRwaCountdown } from "../../hooks/useShowRwaCountdown";
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
  import("../../components/desktop/riskRate").then((mod) => {
    return {
      default: mod.RiskRateWidget,
    };
  }),
);

const LazyAssetViewWidget = React.lazy(() =>
  import("../../components/desktop/assetView").then((mod) => {
    return {
      default: mod.AssetViewWidget,
    };
  }),
);

export type DesktopLayoutProps = TradingState & {
  className?: string;
};

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
    max4XL,
    animating,
    setAnimating,
    showPositionIcon,
    horizontalDraggable,
    marketsWidth,
    dataListMinHeight,
  } = props;

  const { showCountdown, closeCountdown } = useShowRwaCountdown(props.symbol);
  const symbolInfoBarHeight = useMemo(() => {
    return showCountdown ? 104 : 56;
  }, [showCountdown]);

  const { isRwa, open } = useGetRwaSymbolOpenStatus(props.symbol);

  useEffect(() => {
    if (isRwa && !open) {
      showRwaOutsideMarketHoursNotify();
    }
  }, [isRwa, open, props.symbol]);

  const [tradingViewFullScreen] = useLocalStorage(
    TradingviewFullscreenKey,
    false,
  );

  const [sortableItems, setSortableItems] = useLocalStorage<string[]>(
    OrderEntrySortKeys,
    ["margin", "assets", "orderEntry"],
  );

  const dropAnimationConfig = useMemo(() => {
    return {
      keyframes({
        transform,
      }: {
        transform: {
          initial: Transform;
          final: Transform;
        };
      }) {
        return [
          {
            transform: CSS.Transform.toString({
              ...transform.initial,
              scaleX: 1.05,
              scaleY: 1.05,
            }),
          },
          {
            transform: CSS.Transform.toString({
              ...transform.final,
              scaleX: 1,
              scaleY: 1,
            }),
          },
        ];
      },
      sideEffects: ({ active, dragOverlay }) => {
        active.node.style.opacity = "0";
        const innerElement = dragOverlay.node.querySelector(".inner-content");
        if (innerElement) {
          innerElement.classList.add("oui-animate-shake");
        }
        return () => {
          active.node.style.opacity = "";
        };
      },
    };
  }, []);

  // Configure sensors for drag and drop interactions
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // State for drag overlay management
  const [activeId, setActiveId] = useState<string | null>(null);

  /**
   * Handle drag start event for sortable panels
   * Sets the active dragging item for overlay rendering
   */
  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  /**
   * Handle drag end event for sortable panels
   * Updates the order of sortable items and corresponding positions
   */
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id && over) {
      const oldIndex = sortableItems.indexOf(active.id as string);
      const newIndex = sortableItems.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Update sortableItems order
        const newItems = arrayMove(sortableItems, oldIndex, newIndex);
        setSortableItems(newItems as string[]);

        // Also update positions to keep them in sync
        // updatePositions(oldIndex, newIndex);
      }
    }

    // Reset active id after drag ends
    setActiveId(null);
  }

  const minScreenHeight = useMemo(() => {
    return tradingViewFullScreen
      ? 0
      : symbolInfoBarHeight +
          orderbookMaxHeight +
          dataListInitialHeight +
          space * 4;
  }, [tradingViewFullScreen]);

  const minScreenHeightSM =
    topBarHeight +
    bottomBarHeight +
    symbolInfoBarHeight +
    tradindviewMinHeight +
    orderbookMinHeight +
    dataListMinHeight +
    space * 4;

  const horizontalMarketsView = (
    <HorizontalMarketsWidget
      symbol={props.symbol}
      onSymbolChange={props.onSymbolChange}
      maxItems={-1} // show all markets
      dropdownPos={marketLayout === "bottom" ? "top" : "bottom"}
    />
  );

  const containerPaddingX = useMemo(() => (max2XL ? 12 : 8), [max2XL]);

  const stickyHorizontalMarketsView = (
    <Box
      className={cn(
        "oui-bg-base-10",
        // -8 is for reducing the container's padding
        "oui-sticky oui-z-30 oui-mb-[-8px] oui-py-2",
        // Split line disabled for > 2xl screens
        !max2XL && "oui-mt-[-8px]",
      )}
      style={{
        bottom: 0,
        minWidth:
          (max2XL ? 1024 : 1440) - scrollBarWidth - containerPaddingX * 2,
      }}
    >
      {horizontalMarketsView}
    </Box>
  );

  const marketsWidget = (
    <SideMarketsWidget
      resizeable={resizeable}
      panelSize={panelSize}
      onPanelSizeChange={
        onPanelSizeChange as (size: "small" | "middle" | "large") => void
      }
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
      onTransitionEnd={() => setAnimating(false)}
    >
      {!animating && marketLayout === "left" && marketsWidget}
    </Box>
  );

  const orderInteractionWidgets = useMemo(() => {
    return {
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
              props.disableFeatures as unknown as (
                | "slippageSetting"
                | "feesInfo"
              )[]
            }
          />
        ),
      },
    };
  }, [
    props.isFirstTimeDeposit,
    props.disableFeatures,
    props.navigateToPortfolio,
    props.symbol,
  ]);

  /** Registry props for strategy-based layout; passed to createTradingPanelRegistry */
  const registryProps: TradingPanelRegistryProps = useMemo(
    () => ({
      symbol: props.symbol,
      onSymbolChange: props.onSymbolChange,
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

  const initialLayout = useMemo(
    () =>
      createTradingDesktopLayout(max2XL ? "max2XL" : "default", layout, {
        mainSplitSize,
        orderBookSplitSize,
        dataListSplitSize,
      }),
    [max2XL, layout, mainSplitSize, orderBookSplitSize, dataListSplitSize],
  );

  const layoutStorageKey = max2XL
    ? "orderly_trading_desktop_layout_sm"
    : "orderly_trading_desktop_layout";

  const { strategy } = resolveTradingLayoutStrategy();

  /** Strategy-based layout: LayoutHost renders panels according to initialLayout (split tree) */
  const layoutHostContent = (
    <LayoutHost
      strategy={strategy}
      panels={panels}
      initialLayout={initialLayout}
      storageKey={layoutStorageKey}
      className={cn(
        "oui-flex oui-flex-1 oui-overflow-hidden",
        max2XL && "oui-size-full oui-min-w-[1018px] oui-px-3 oui-py-2",
      )}
      style={
        max2XL
          ? {
              minHeight: minScreenHeightSM,
              minWidth: 1024 - scrollBarWidth,
            }
          : { flex: 1, minHeight: minScreenHeight }
      }
    />
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext
        items={sortableItems}
        strategy={verticalListSortingStrategy}
      >
        {max2XL ? (
          <Box height="100%">
            {marketLayout === "top" && (
              <Box
                className={cn("oui-mt-2 oui-max-h-8 oui-px-3", props.className)}
              >
                {horizontalMarketsView}
              </Box>
            )}
            {layoutHostContent}
            {marketLayout === "bottom" && stickyHorizontalMarketsView}
          </Box>
        ) : (
          <Flex
            style={{
              minHeight: minScreenHeight,
              minWidth: 1440 - scrollBarWidth,
            }}
            className={cn(
              props.className,
              "oui-justify-start",
              tradingViewFullScreen &&
                "oui-relative oui-h-[calc(100vh-80px)] oui-w-screen oui-overflow-hidden !oui-p-0",
            )}
            width="100%"
            p={2}
            gap={2}
            itemAlign="stretch"
            direction="column"
          >
            {marketLayout === "top" && horizontalMarketsView}
            <Flex
              className={cn(
                "oui-flex-1 oui-overflow-hidden",
                layout === "left" && "oui-flex-row-reverse",
              )}
              gap={2}
            >
              {!max4XL && marketLayout === "left" && marketsView}
              {layoutHostContent}
            </Flex>
            {marketLayout === "bottom" && stickyHorizontalMarketsView}
          </Flex>
        )}
      </SortableContext>
      <DragOverlay dropAnimation={dropAnimationConfig}>
        {activeId ? (
          <SortablePanel
            id={activeId}
            showIndicator={showPositionIcon}
            dragOverlay
            className={`${
              orderInteractionWidgets[
                activeId as keyof typeof orderInteractionWidgets
              ].className
            } oui-shadow-lg oui-shadow-base-9`}
          >
            {
              orderInteractionWidgets[
                activeId as keyof typeof orderInteractionWidgets
              ].element
            }
          </SortablePanel>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
