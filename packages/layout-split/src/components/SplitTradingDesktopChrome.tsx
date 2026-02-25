/**
 * Split layout chrome: markets (top/left/bottom), DnD for order-entry sortable, Flex wrapper.
 * Wraps the minimal desktop layout (Trading’s DesktopLayout); strategy is injected by the plugin.
 */
import React, { useMemo, useState } from "react";
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
  HorizontalMarketsWidget,
  SideMarketsWidget,
} from "@orderly.network/markets";
import {
  OrderEntryDragOverlayContent,
  useShowRwaCountdown,
  type DesktopLayoutProps,
} from "@orderly.network/trading";
import {
  scrollBarWidth,
  topBarHeight,
  bottomBarHeight,
  space,
  orderbookMinHeight,
  orderbookMaxHeight,
  tradindviewMinHeight,
  dataListInitialHeight,
} from "@orderly.network/trading";
import { Box, cn, Flex } from "@orderly.network/ui";

export interface SplitTradingDesktopChromeProps extends DesktopLayoutProps {
  /** The minimal desktop layout (panels + LayoutHost) to wrap */
  children: React.ReactNode;
}

/**
 * Drop animation for drag overlay (scale + shake)
 */
function useDropAnimationConfig() {
  return useMemo(
    () => ({
      keyframes({
        transform,
      }: {
        transform: { initial: Transform; final: Transform };
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
      sideEffects: ({
        active,
        dragOverlay,
      }: {
        active: { node: HTMLElement };
        dragOverlay: { node: HTMLElement };
      }) => {
        active.node.style.opacity = "0";
        const inner = dragOverlay.node.querySelector(".inner-content");
        if (inner) inner.classList.add("oui-animate-shake");
        return () => {
          active.node.style.opacity = "";
        };
      },
    }),
    [],
  );
}

/**
 * Wraps Trading’s minimal desktop layout with split-specific chrome:
 * DnD (order-entry sortable), market layout (top/left/bottom), Flex structure.
 */
export function SplitTradingDesktopChrome(
  props: SplitTradingDesktopChromeProps,
): React.ReactElement {
  const {
    children,
    marketLayout,
    layout,
    max2XL,
    max4XL,
    tradingViewFullScreen,
    showPositionIcon,
    sortableItems,
    setSortableItems,
    symbol,
    onSymbolChange,
    dataListMinHeight,
    className,
  } = props;

  const { showCountdown } = useShowRwaCountdown(symbol);
  const symbolInfoBarHeight = useMemo(
    () => (showCountdown ? 104 : 56),
    [showCountdown],
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  const dropAnimationConfig = useDropAnimationConfig();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && over) {
      const oldIndex = sortableItems.indexOf(active.id as string);
      const newIndex = sortableItems.indexOf(over.id as string);
      if (oldIndex !== -1 && newIndex !== -1) {
        setSortableItems(
          arrayMove(sortableItems, oldIndex, newIndex) as string[],
        );
      }
    }
    setActiveId(null);
  };

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

  const horizontalMarketsView = (
    <HorizontalMarketsWidget
      symbol={symbol}
      onSymbolChange={onSymbolChange}
      maxItems={-1}
      dropdownPos={marketLayout === "bottom" ? "top" : "bottom"}
    />
  );

  const containerPaddingX = useMemo(() => (max2XL ? 12 : 8), [max2XL]);

  const stickyHorizontalMarketsView = (
    <Box
      className={cn(
        "oui-bg-base-10",
        "oui-sticky oui-z-30 oui-mb-[-8px] oui-py-2",
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
      resizeable={props.resizeable}
      panelSize={props.panelSize}
      onPanelSizeChange={
        props.onPanelSizeChange as React.Dispatch<
          React.SetStateAction<"small" | "middle" | "large">
        >
      }
      symbol={symbol}
      onSymbolChange={onSymbolChange}
    />
  );

  const marketsView = (
    <Box
      intensity={900}
      pt={3}
      r="2xl"
      height="100%"
      width={props.marketsWidth}
      style={{ minWidth: props.marketsWidth }}
      className="oui-transition-all oui-duration-150"
      onTransitionEnd={() => props.setAnimating?.(false)}
    >
      {!props.animating && marketLayout === "left" && marketsWidget}
    </Box>
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
              <Box className={cn("oui-mt-2 oui-max-h-8 oui-px-3", className)}>
                {horizontalMarketsView}
              </Box>
            )}
            {children}
            {marketLayout === "bottom" && stickyHorizontalMarketsView}
          </Box>
        ) : (
          <Flex
            style={{
              minHeight: minScreenHeight,
              minWidth: 1440 - scrollBarWidth,
            }}
            className={cn(
              className,
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
              {children}
            </Flex>
            {marketLayout === "bottom" && stickyHorizontalMarketsView}
          </Flex>
        )}
      </SortableContext>
      <DragOverlay dropAnimation={dropAnimationConfig}>
        <OrderEntryDragOverlayContent
          activeId={activeId}
          showPositionIcon={showPositionIcon}
          symbol={symbol}
          disableFeatures={props.disableFeatures}
          navigateToPortfolio={props.navigateToPortfolio}
          isFirstTimeDeposit={props.isFirstTimeDeposit}
        />
      </DragOverlay>
    </DndContext>
  );
}
