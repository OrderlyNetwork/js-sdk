import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Modifier,
  type ClientRect,
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
  useAccount,
  useGetRwaSymbolOpenStatus,
  useLocalStorage,
  useWalletConnector,
  useOrderlyContext,
} from "@orderly.network/hooks";
import {
  SideMarketsWidget,
  SymbolInfoBarFullWidget,
  HorizontalMarketsWidget,
} from "@orderly.network/markets";
import {
  OrderEntrySortKeys,
  TradingviewFullscreenKey,
} from "@orderly.network/types";
import { Box, cn, Flex, ThrottledButton } from "@orderly.network/ui";
import { useFloatingDialogPosition } from "@orderly.network/ui-floating-ball";
import { OrderEntryWidget } from "@orderly.network/ui-order-entry";
import { TradingviewWidget } from "@orderly.network/ui-tradingview";
import { DepositStatusWidget } from "@orderly.network/ui-transfer";
import { AiModeToggleButton } from "../../components/desktop/AiModeToggleButton";
import { SortablePanel } from "../../components/desktop/layout/sortablePanel";
import { SplitLayout } from "../../components/desktop/layout/splitLayout";
import { showRwaOutsideMarketHoursNotify } from "../../components/desktop/notify/rwaNotification";
import { useAiBoxRect } from "../../hooks";
import { useShowRwaCountdown } from "../../hooks/useShowRwaCountdown";
import {
  dataListInitialHeight,
  getOffsetSizeNum,
  TradingState,
} from "./trading.script";
import {
  scrollBarWidth,
  topBarHeight,
  bottomBarHeight,
  space,
  orderEntryMinWidth,
  orderEntryMaxWidth,
  orderbookMinWidth,
  orderbookMaxWidth,
  orderbookMinHeight,
  orderbookMaxHeight,
  tradindviewMinHeight,
  tradingViewMinWidth,
  dataListMaxHeight,
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

const LazyDataListWidget = React.lazy(() =>
  import("../../components/desktop/dataList").then((mod) => {
    return {
      default: mod.DataListWidget,
    };
  }),
);

const LazySwitchLayout = React.lazy(() =>
  import("../../components/desktop/layout/switchLayout").then((mod) => {
    return {
      default: mod.SwitchLayout,
    };
  }),
);

const LazyOrderBookAndTradesWidget = React.lazy(() =>
  import("../../components/desktop/orderBookAndTrades").then((mod) => {
    return {
      default: mod.OrderBookAndTradesWidget,
    };
  }),
);

const LazyEvmFloatingStarchildBall = React.lazy(() =>
  import("../../components/desktop/FloatingStarchildBall").then((mod) => ({
    default: mod.FloatingStarchildBall,
  })),
);

const LazyAiSideChatWidget = React.lazy(() =>
  import("@orderly.network/ui-floating-ball").then((mod) => ({
    default: mod.AiSideChatWidget,
  })),
);

export type DesktopLayoutProps = TradingState & {
  className?: string;
};

const scaleModifier: Modifier = ({
  transform,
  draggingNodeRect,
}: {
  transform: Transform;
  draggingNodeRect: ClientRect | null;
}) => {
  if (draggingNodeRect) {
    return {
      ...transform,
      scaleX: 2.05,
      scaleY: 2.05,
    };
  }
  return transform;
};

export const DesktopLayout: React.FC<DesktopLayoutProps> = (props) => {
  const { starChildConfig } = useOrderlyContext();
  const starChildEnabled = starChildConfig?.enable ?? false;

  // Read & update floating dialog position and log changes
  const {
    position: floatingDialogPosition,
    setPosition: setFloatingDialogPosition,
  } = useFloatingDialogPosition("ORDERLY_FLOATING_DIALOG_TELEGRAM");

  const {
    resizeable,
    panelSize,
    onPanelSizeChange,
    layout,
    onLayout,
    marketLayout,
    onMarketLayout,
    orderBookSplitSize,
    setOrderbookSplitSize,
    dataListSplitSize,
    setDataListSplitSize,
    mainSplitSize,
    setMainSplitSize,
    dataListSplitHeightSM,
    setDataListSplitHeightSM,
    orderBookSplitHeightSM,
    setOrderbookSplitHeightSM,
    max2XL,
    max4XL,
    animating,
    setAnimating,
    updatePositions,
    showPositionIcon,
    horizontalDraggable,
    marketsWidth,
    tradindviewMaxHeight,
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

  const [aiMode, setAiMode] = useState(false);

  // Respond to Starchild chat docking events
  useEffect(() => {
    const onDocked = (e: Event) => {
      const detail = (e as CustomEvent<{ side: "left" | "right" }>).detail;
      const dockSide = detail?.side;
      if (!dockSide) return;
      // if ((layout === 'left' && dockSide === 'left') || (layout === 'right' && dockSide === 'right')) {
      //   setAiMode(true);
      // }
      setAiMode(true); // allow for different side docking for now
    };
    const onDetached = () => {
      setAiMode(false);
    };
    const onClosed = () => {
      setAiMode(false);
    };
    window.addEventListener("starchild:chatDocked", onDocked as EventListener);
    window.addEventListener(
      "starchild:chatDetached",
      onDetached as EventListener,
    );
    window.addEventListener("starchild:chatClosed", onClosed as EventListener);
    return () => {
      window.removeEventListener(
        "starchild:chatDocked",
        onDocked as EventListener,
      );
      window.removeEventListener(
        "starchild:chatDetached",
        onDetached as EventListener,
      );
      window.removeEventListener(
        "starchild:chatClosed",
        onClosed as EventListener,
      );
    };
  }, [layout]);

  // Dock-to-edge detection (no dragging state needed). Show guideline while at edge.
  const [isDockingRight, setIsDockingRight] = useState(false);
  const [isDockingLeft, setIsDockingLeft] = useState(false);
  useEffect(() => {
    const right = (floatingDialogPosition as any)?.right;
    const left = (floatingDialogPosition as any)?.left;
    if (layout === "right") {
      setIsDockingRight(typeof right === "number" && right <= 0);
      setIsDockingLeft(false);
    } else if (layout === "left") {
      setIsDockingLeft(typeof left === "number" && left <= 40);
      setIsDockingRight(false);
    } else {
      setIsDockingLeft(false);
      setIsDockingRight(false);
    }
  }, [floatingDialogPosition, layout]);
  // Switch to AI mode on mouse/touch release if docked at right edge
  useEffect(() => {
    const handleRelease = () => {
      const right = (floatingDialogPosition as any)?.right;
      const left = (floatingDialogPosition as any)?.left;
      const atRightEdge = typeof right === "number" && right <= 0;
      const atLeftEdge = typeof left === "number" && left <= 40;
      if (layout === "right") {
        if ((isDockingRight || atRightEdge) && !aiMode) {
          setAiMode(true);
        }
      } else if (layout === "left") {
        if ((isDockingLeft || atLeftEdge) && !aiMode) {
          setAiMode(true);
        }
      }
      // Hide guidelines after release
      setIsDockingRight(false);
      setIsDockingLeft(false);
    };
    document.addEventListener("mouseup", handleRelease);
    document.addEventListener("touchend", handleRelease);
    return () => {
      document.removeEventListener("mouseup", handleRelease);
      document.removeEventListener("touchend", handleRelease);
    };
  }, [floatingDialogPosition, isDockingRight, isDockingLeft, aiMode, layout]);

  // Calculate bottom offset for AI box height
  // On small screens (max2XL), we need to account for the dataList below
  const aiBoxBottomOffset = useMemo(() => {
    return 8;
    // if (!max2XL) {
    //   return 8; // Standard padding for large screens
    // }
    // // For small screens: dataList height + spacing + container padding
    // const dataListHeight = typeof dataListSplitHeightSM === 'string'
    //   ? parseInt(dataListSplitHeightSM)
    //   : dataListSplitHeightSM || dataListMinHeight;
    // const spacing = 12; // gapY={3} in Flex (3 * 4px = 12px)
    // const containerPadding = 8; // py-2 (2 * 4px = 8px)
    // return dataListHeight + spacing + containerPadding;
  }, [max2XL, dataListSplitHeightSM, dataListMinHeight]);

  const { ref: aiBoxRef, rect: aiBoxRect } = useAiBoxRect<HTMLDivElement>(
    aiMode,
    aiBoxBottomOffset,
  );

  // Calculate the AI box height based on viewport height rather than free area
  const [viewportHeight, setViewportHeight] = useState<number>(
    typeof window !== "undefined" ? window.innerHeight : 0,
  );

  useEffect(() => {
    const onResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const aiBoxHeightPx = useMemo(() => {
    if (!aiBoxRect) return undefined;
    const topOffsetFromViewport = aiBoxRect.y;
    const availableHeight = Math.max(
      0,
      viewportHeight -
        bottomBarHeight -
        topOffsetFromViewport -
        aiBoxBottomOffset,
    );
    return availableHeight;
  }, [aiBoxRect, aiBoxBottomOffset, viewportHeight]);

  // When AI mode is active, fix the order entry width to 476px
  useEffect(() => {
    if (aiMode && typeof setMainSplitSize === "function") {
      setMainSplitSize("476px");
    }
  }, [aiMode, setMainSplitSize]);

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
              // scaleX: 0.85,
              // scaleY: 0.85,
            }),
          },
        ];
      },
      sideEffects: ({
        active,
        dragOverlay,
      }: {
        active: any;
        dragOverlay: any;
      }) => {
        // console.log(active.node);
        active.node.style.opacity = "0";
        const innerElement = dragOverlay.node.querySelector(".inner-content");
        if (innerElement) {
          // innerElement.animate(
          //   [{ transform: "scale(1.05)" }, { transform: "scale(1)" }],
          //   {
          //     duration: 200,
          //     easing: "ease-out",
          //   },
          // );
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
      onPanelSizeChange={onPanelSizeChange as any}
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

  const symbolInfoBarView = (
    <Box
      intensity={900}
      r="2xl"
      px={3}
      width="100%"
      style={{
        minHeight: symbolInfoBarHeight,
        height: symbolInfoBarHeight,
      }}
    >
      <SymbolInfoBarFullWidget
        symbol={props.symbol}
        onSymbolChange={props.onSymbolChange}
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
    </Box>
  );

  const { library_path, ...restTradingViewConfig } = props.tradingViewConfig;

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
      symbol={props.symbol}
      {...restTradingViewConfig}
      libraryPath={library_path}
    />
  );

  const tradingView = (
    <Box
      width="100%"
      height="100%"
      intensity={900}
      r="2xl"
      style={{ flex: 1, minWidth: tradingViewMinWidth }}
      className="oui-overflow-hidden"
    >
      {tradingviewWidget}
    </Box>
  );

  const orderbookWidget = (
    <React.Suspense fallback={null}>
      <LazyOrderBookAndTradesWidget symbol={props.symbol} />
    </React.Suspense>
  );

  const orderbookView = (
    <Box
      r="2xl"
      height="100%"
      style={{
        minWidth: orderbookMinWidth,
        maxWidth: horizontalDraggable ? orderbookMaxWidth : orderbookMinWidth,
        width: orderBookSplitSize,
      }}
      className="oui-overflow-hidden"
    >
      {orderbookWidget}
    </Box>
  );

  const dataListWidget = (
    <React.Suspense fallback={null}>
      <LazyDataListWidget
        current={undefined}
        symbol={props.symbol}
        sharePnLConfig={props.sharePnLConfig}
      />
    </React.Suspense>
  );

  const dataListView = (
    <Box
      intensity={900}
      r="2xl"
      p={2}
      style={{
        height: dataListSplitSize,
        // height: `calc(100% - ${symbolInfoBarHeight}px - ${orderbookMaxHeight}px - ${space}px)`,
        minHeight: dataListInitialHeight,
        // minHeight: `max(${dataListMinHeight}px, calc(100vh - ${symbolInfoBarHeight}px - ${orderbookMaxHeight}px - ${space}px))`,
      }}
      className="oui-overflow-hidden"
    >
      {dataListWidget}
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

  const orderEntryView = (
    <Flex
      gapY={2}
      direction="column"
      height="100%"
      style={{
        minWidth: aiMode ? 476 : orderEntryMinWidth,
        maxWidth: aiMode
          ? 476
          : horizontalDraggable
            ? orderEntryMaxWidth
            : orderEntryMinWidth,
        width: aiMode ? "476px" : mainSplitSize,
      }}
    >
      {starChildEnabled && (
        <AiModeToggleButton
          onClick={() => setAiMode((v) => !v)}
          aiMode={aiMode}
        />
      )}
      {aiMode ? (
        <Box
          id="sideChatContainer"
          className="oui-w-full oui-rounded-2xl oui-border oui-border-base-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0, rgba(255,255,255,0.06) 12px, transparent 12px, transparent 24px)",
            height: aiBoxHeightPx ?? `calc(100vh - ${bottomBarHeight}px)`,
          }}
          ref={aiBoxRef}
        />
      ) : (
        <>
          {sortableItems.map((key: string) => {
            return (
              <SortablePanel
                key={key}
                id={key}
                showIndicator={showPositionIcon}
                className={
                  orderInteractionWidgets[
                    key as keyof typeof orderInteractionWidgets
                  ].className
                }
              >
                {
                  orderInteractionWidgets[
                    key as keyof typeof orderInteractionWidgets
                  ].element
                }
              </SortablePanel>
            );
          })}
        </>
      )}
    </Flex>
  );

  const renderTradingView = () => {
    if (max4XL && layout === "right") {
      return (
        <Flex
          gap={2}
          className="oui-flex-1 oui-overflow-hidden"
          style={{ minWidth: marketsWidth + tradingViewMinWidth + space }}
        >
          {marketLayout === "left" && marketsView}
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
      disable={!horizontalDraggable}
    >
      {renderTradingView()}
      {orderbookView}
    </SplitLayout>
  );

  const renderTradingViewAndOrderbookView = () => {
    if (max4XL && layout === "left") {
      return (
        <Flex gapX={2} style={{ minHeight: orderbookMinHeight }} height="100%">
          {tradingViewAndOrderbookView}
          {marketLayout === "left" && marketsView}
        </Flex>
      );
    }
    return tradingViewAndOrderbookView;
  };

  const mainView = (
    <Flex
      direction="column"
      className="oui-flex-1 oui-overflow-hidden"
      gap={2}
      style={{
        minWidth: max4XL
          ? marketsWidth + tradingViewMinWidth + orderbookMinWidth + space * 2
          : tradingViewMinWidth + orderbookMinWidth + space,
      }}
    >
      {symbolInfoBarView}
      <SplitLayout
        style={{
          // height: orderbookMaxHeight + dataListInitialHeight + space,
          maxHeight: `calc(100% - ${symbolInfoBarHeight}px - ${space}px)`,
        }}
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

  if (max2XL) {
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
          <Box height="100%">
            {marketLayout === "top" && (
              <Box
                className={cn("oui-mt-2 oui-max-h-8 oui-px-3", props.className)}
              >
                {horizontalMarketsView}
              </Box>
            )}

            <SplitLayout
              ref={props.max2XLSplitRef}
              style={{
                minHeight: minScreenHeightSM,
                minWidth: 1024 - scrollBarWidth,
                // height: props.extraHeight ? props.extraHeight : undefined,
              }}
              className={cn(
                "oui-flex oui-flex-1",
                "oui-size-full oui-min-w-[1018px]",
                "oui-px-3 oui-py-2",
                props.className,
              )}
              onSizeChange={setDataListSplitHeightSM}
              onDragging={props.onDataListSplitHeightDragging}
              mode="vertical"
            >
              <Flex
                gapX={2}
                itemAlign="stretch"
                className={cn(
                  "oui-flex-1",
                  layout === "left" && "oui-flex-row-reverse",
                )}
                style={{
                  minHeight: Math.max(
                    symbolInfoBarHeight +
                      tradindviewMinHeight +
                      orderbookMinHeight +
                      space * 2,
                    props.orderEntryHeight,
                  ),
                  maxHeight:
                    symbolInfoBarHeight +
                    tradindviewMaxHeight +
                    orderbookMaxHeight +
                    space * 2,
                }}
              >
                <Flex
                  height="100%"
                  className="oui-w-[calc(100%_-_280px_-_12px)] oui-flex-1"
                  direction="column"
                  gapY={2}
                >
                  {symbolInfoBarView}
                  <Flex
                    width="100%"
                    height="100%"
                    gapX={2}
                    itemAlign="stretch"
                    style={{
                      minHeight:
                        tradindviewMinHeight + orderbookMinHeight + space,
                      maxHeight:
                        tradindviewMaxHeight + orderbookMaxHeight + space,
                    }}
                    className={cn(
                      "oui-flex-1",
                      layout === "left" && "oui-flex-row-reverse",
                    )}
                  >
                    {marketLayout === "left" && (
                      <Box
                        intensity={900}
                        pt={3}
                        r="2xl"
                        width={marketsWidth}
                        style={{
                          minHeight:
                            tradindviewMinHeight + orderbookMinHeight + space,
                          maxHeight:
                            tradindviewMaxHeight + orderbookMaxHeight + space,
                        }}
                      >
                        {marketsWidget}
                      </Box>
                    )}
                    <SplitLayout
                      ref={props.tradingviewAndOrderbookSplitRef}
                      mode="vertical"
                      style={{ width: `calc(100% - ${marketsWidth}px)` }}
                      className="oui-flex-1"
                      onSizeChange={setOrderbookSplitHeightSM}
                      onDragging={props.onTradingviewAndOrderbookDragging}
                    >
                      <Box
                        width="100%"
                        intensity={900}
                        r="2xl"
                        style={{
                          minHeight: tradindviewMinHeight,
                          maxHeight: tradindviewMaxHeight,
                          height: 1200,
                        }}
                      >
                        {tradingviewWidget}
                      </Box>

                      <Box
                        r="2xl"
                        height="100%"
                        width="100%"
                        style={{
                          minHeight: orderbookMinHeight,
                          maxHeight: orderbookMaxHeight,
                          height: orderBookSplitHeightSM,
                        }}
                        className="oui-flex-1"
                      >
                        {orderbookWidget}
                      </Box>
                    </SplitLayout>
                  </Flex>
                </Flex>
                <Flex
                  ref={props.orderEntryViewRef}
                  id="orderEntryView"
                  gapY={3}
                  direction="column"
                  className="oui-relative"
                  style={{
                    width: aiMode ? 476 : orderEntryMinWidth,
                    height: aiMode ? "100%" : "max-content",
                  }}
                >
                  <Flex
                    gapY={2}
                    direction="column"
                    height="100%"
                    style={{
                      minWidth: aiMode ? 476 : orderEntryMinWidth,
                      maxWidth: aiMode
                        ? 476
                        : horizontalDraggable
                          ? orderEntryMaxWidth
                          : orderEntryMinWidth,
                      width: aiMode ? "476px" : mainSplitSize,
                    }}
                  >
                    {starChildEnabled && (
                      <AiModeToggleButton
                        onClick={() => setAiMode((v) => !v)}
                        aiMode={aiMode}
                      />
                    )}
                    {aiMode ? (
                      <Box
                        id="sideChatContainer"
                        className="oui-w-full oui-rounded-md oui-border oui-border-base-10"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0, rgba(255,255,255,0.06) 12px, transparent 12px, transparent 24px)",
                          height:
                            aiBoxHeightPx ??
                            `calc(100vh - ${bottomBarHeight}px)`,
                        }}
                        ref={aiBoxRef}
                      />
                    ) : (
                      <>
                        {sortableItems.map((key: string) => {
                          return (
                            <SortablePanel
                              key={key}
                              id={key}
                              showIndicator={showPositionIcon}
                              className={
                                orderInteractionWidgets[
                                  key as keyof typeof orderInteractionWidgets
                                ].className
                              }
                            >
                              {
                                orderInteractionWidgets[
                                  key as keyof typeof orderInteractionWidgets
                                ].element
                              }
                            </SortablePanel>
                          );
                        })}
                      </>
                    )}
                  </Flex>
                  <Box height={props.extraHeight} />
                </Flex>
              </Flex>

              <Box
                intensity={900}
                r="2xl"
                p={2}
                style={{
                  height: dataListSplitHeightSM,
                  minHeight: Math.max(dataListMinHeight, props.dataListHeight),
                  maxHeight: dataListMaxHeight,
                }}
                className="oui-overflow-hidden"
              >
                {dataListWidget}
              </Box>

              {marketLayout === "bottom" && stickyHorizontalMarketsView}
            </SplitLayout>
          </Box>
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
        {starChildEnabled && (
          <React.Suspense fallback={null}>
            <LazyEvmFloatingStarchildBall />
          </React.Suspense>
        )}
        {/* <React.Suspense fallback={null}>
          <LazyAiSideChatWidget rect={aiBoxRect as any} text="AI Side Chat" />
        </React.Suspense> */}
        {isDockingRight && <DockingIndicator position="right" />}
        {isDockingLeft && <DockingIndicator position="left" />}
      </DndContext>
    );
  }

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
          {/* Horizontal Markets View on top for !=2xl screens */}
          {marketLayout === "top" && horizontalMarketsView}

          {/* Main Content Group */}
          <Flex
            className={cn(
              "oui-flex-1 oui-overflow-hidden",
              layout === "left" && "oui-flex-row-reverse",
            )}
            gap={2}
          >
            {!max4XL && marketLayout === "left" && marketsView}
            <SplitLayout
              className={cn("oui-flex oui-flex-1 oui-overflow-hidden")}
              onSizeChange={onSizeChange}
              disable={!horizontalDraggable || aiMode}
            >
              {layout === "left" && orderEntryView}
              {mainView}
              {layout === "right" && orderEntryView}
            </SplitLayout>
          </Flex>

          {marketLayout === "bottom" && stickyHorizontalMarketsView}
        </Flex>
      </SortableContext>
      <DragOverlay
        dropAnimation={dropAnimationConfig}

        // style={{
        //   transform: "scale(1.05)",
        // }}
        // transition="transform 200ms ease"
        // className="oui-animate-pop"
      >
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
      {starChildEnabled && (
        <React.Suspense fallback={null}>
          <LazyEvmFloatingStarchildBall />
        </React.Suspense>
      )}
      {/* <React.Suspense fallback={null}>
        <LazyAiSideChatWidget rect={aiBoxRect as any} text="AI Side Chat" />
      </React.Suspense> */}
      {isDockingRight && <DockingIndicator position="right" />}
      {isDockingLeft && <DockingIndicator position="left" />}
    </DndContext>
  );
};

const DockingIndicator: React.FC<{ position: "left" | "right" }> = ({
  position,
}) => {
  return (
    <div
      className={cn(
        "oui-fixed oui-top-0 oui-bottom-0 oui-z-[60] oui-w-1 oui-bg-primary-darken oui-rounded-sm",
        position === "left" ? "oui-left-0" : "oui-right-0",
      )}
    />
  );
};
