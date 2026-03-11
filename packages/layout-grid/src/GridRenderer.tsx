import React, { useMemo, useCallback, useEffect, useRef } from "react";
import {
  GridLayout,
  useContainerWidth,
  useResponsiveLayout,
  getCompactor,
  type Layout,
  type LayoutItem,
  type CompactType,
} from "react-grid-layout";
import type { LayoutRendererProps } from "@orderly.network/layout-core";
import type { GridLayoutModel, GridLayoutItem } from "./types";
import { DEFAULT_BREAKPOINTS, DEFAULT_COLS } from "./utils/gridLayoutUtils";

/** Breakpoint key type */
type BreakpointKey = "lg" | "md" | "sm" | "xs" | "xxs";

/** Responsive layouts: breakpoint -> Layout (readonly LayoutItem[] in v2) */
type ResponsiveLayouts = Partial<Record<string, Layout>>;

/**
 * Convert GridLayoutItem[] to react-grid-layout Layout (readonly LayoutItem[]).
 */
function toReactGridLayouts(
  layouts: GridLayoutModel["layouts"],
): ResponsiveLayouts {
  const result: Record<string, LayoutItem[]> = {};

  (Object.keys(layouts) as BreakpointKey[]).forEach((breakpoint) => {
    const items = layouts[breakpoint];
    if (items) {
      result[breakpoint] = items.map((item) => ({
        i: item.i,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        minW: item.minW,
        minH: item.minH,
        maxW: item.maxW,
        maxH: item.maxH,
        static: item.static,
        isDraggable: item.isDraggable,
        isResizable: item.isResizable,
        resizeHandles: item.resizeHandles,
      }));
    }
  });

  return result as ResponsiveLayouts;
}

/**
 * Grid layout renderer component
 * Renders a responsive grid layout using react-grid-layout
 */
export function GridRenderer(
  props: LayoutRendererProps<GridLayoutModel>,
): React.ReactElement {
  const { layout, panels, onLayoutChange, className, style } = props;
  const { width, containerRef, mounted } = useContainerWidth();

  // Use ref to track the current layouts for comparison
  // This avoids stale closure issues in the callback
  const layoutsRef = useRef(layout.layouts);

  // Sync ref when external layout changes
  useEffect(() => {
    layoutsRef.current = layout.layouts;
  }, [layout.layouts]);

  // Convert to react-grid-layout format
  const reactGridLayouts = useMemo(
    () => toReactGridLayouts(layout.layouts),
    [layout.layouts],
  );

  // Handle layout change from react-grid-layout v2
  // The callback receives current breakpoint layout and all layouts
  const handleLayoutChange = useCallback(
    (_currentLayout: Layout, _allLayouts: ResponsiveLayouts) => {
      // We use the ref to get the current layouts state
      // The callback is mainly to trigger state sync
      // Notify parent of layout change
      onLayoutChange({
        ...layout,
        layouts: layoutsRef.current,
      });
    },
    [layout, onLayoutChange],
  );

  // Handle layout change for current breakpoint only
  const handleCurrentLayoutChange = useCallback(
    (newLayout: Layout) => {
      // Update all breakpoints with the new layout
      // This ensures consistency across breakpoints

      const updatedLayouts: GridLayoutModel["layouts"] = {};

      (Object.keys(layoutsRef.current) as BreakpointKey[]).forEach((bp) => {
        updatedLayouts[bp] = newLayout.map((item: LayoutItem) => {
          const originalItem = layoutsRef.current[bp]?.find(
            (i) => i.i === item.i,
          );
          return {
            ...item,
            panelId: originalItem?.panelId || item.i,
          } as GridLayoutItem;
        });
      });

      layoutsRef.current = updatedLayouts;

      // Notify parent of layout change
      onLayoutChange({
        ...layout,
        layouts: layoutsRef.current,
      });
    },
    [layout, onLayoutChange],
  );

  // Use responsive layout hook (v2 API)
  // Must be called after handleLayoutChange and reactGridLayouts are defined
  const { layout: currentLayout, cols } = useResponsiveLayout({
    width,
    breakpoints: layout.breakpoints || DEFAULT_BREAKPOINTS,
    cols: layout.cols || DEFAULT_COLS,
    layouts: reactGridLayouts,
    onLayoutChange: handleLayoutChange,
  });

  // Get panel IDs from layout
  const panelIds = useMemo(() => {
    const ids = new Set<string>();
    Object.values(layout.layouts).forEach((items) => {
      items?.forEach((item) => {
        if (item.panelId) {
          ids.add(item.panelId);
        }
      });
    });
    return Array.from(ids);
  }, [layout.layouts]);

  // Memoize children so the grid compares by reference (react-grid-layout perf recommendation).
  // Must be declared before any early return to satisfy Rules of Hooks.
  const children = useMemo(
    () =>
      panelIds.map((panelId) => {
        const panel = panels.get(panelId);
        if (!panel) {
          console.warn(`Panel ${panelId} not found in registry`);
          return null;
        }
        return (
          <div
            key={panelId}
            className="oui-layout-grid-item oui-bg-base-9 oui-rounded-2xl oui-p-2 oui-relative oui-overflow-hidden"
            style={{ width: "100%", height: "100%" }}
          >
            {panel}
          </div>
        );
      }),
    [panelIds, panels],
  );

  // Handle empty panels
  if (panels.size === 0) {
    return (
      <div
        ref={containerRef as React.RefObject<HTMLDivElement>}
        className={className}
        style={style}
      >
        {/* Empty state - no panels registered */}
      </div>
    );
  }

  if (!mounted) {
    return (
      <div
        ref={containerRef as React.RefObject<HTMLDivElement>}
        className={className}
        style={style}
      />
    );
  }

  return (
    <div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      className={className}
      style={style}
    >
      <GridLayout
        width={width}
        layout={currentLayout}
        gridConfig={{
          cols: cols,
          rowHeight: layout.rowHeight ?? 30,
          margin: layout.margin || [8, 8],
          containerPadding: layout.containerPadding || [0, 0],
        }}
        compactor={getCompactor(
          layout.compactType as CompactType,
          false,
          layout.compactType === null, // preventCollision when compactType is null
        )}
        dragConfig={{
          enabled: layout.isDraggable !== false,
        }}
        resizeConfig={{
          enabled: layout.isResizable !== false,
        }}
        onLayoutChange={handleCurrentLayoutChange}
      >
        {children}
      </GridLayout>
    </div>
  );
}
