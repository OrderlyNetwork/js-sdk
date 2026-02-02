import React, { useMemo, useCallback, useEffect, useRef } from "react";
import {
  Responsive,
  useContainerWidth,
  Layout,
  Layouts,
} from "react-grid-layout";
import type {
  LayoutRendererProps,
  PanelRegistry,
} from "@orderly.network/layout-core";
import type { GridLayoutModel, GridLayoutItem } from "./types";
import { DEFAULT_BREAKPOINTS, DEFAULT_COLS } from "./utils/gridLayoutUtils";

/** Breakpoint key type */
type BreakpointKey = "lg" | "md" | "sm" | "xs" | "xxs";

/**
 * Convert GridLayoutItem[] to react-grid-layout Layout[]
 */
function toReactGridLayouts(
  layouts: GridLayoutModel["layouts"],
): Record<string, Layout[]> {
  const result: Record<string, Layout[]> = {};

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
      }));
    }
  });

  return result;
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

  // Handle layout change from react-grid-layout
  const handleLayoutChange = useCallback(
    (_currentLayout: Layout[], allLayouts: Layouts) => {
      // Convert react-grid-layout Layout[] back to GridLayoutItem[]
      const updatedLayouts: GridLayoutModel["layouts"] = {};

      (Object.keys(allLayouts) as BreakpointKey[]).forEach((breakpoint) => {
        const items = allLayouts[breakpoint];
        if (items) {
          updatedLayouts[breakpoint] = items.map((item) => {
            // Find the original item to preserve panelId
            const originalItem = layoutsRef.current[breakpoint]?.find(
              (i) => i.i === item.i,
            );
            return {
              ...item,
              panelId: originalItem?.panelId || item.i,
            } as GridLayoutItem;
          });
        }
      });

      // Update ref
      layoutsRef.current = updatedLayouts;

      // Notify parent of layout change
      onLayoutChange({
        ...layout,
        layouts: updatedLayouts,
      });
    },
    [layout, onLayoutChange],
  );

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

  // Handle empty panels
  if (panels.size === 0) {
    return (
      <div ref={containerRef} className={className} style={style}>
        {/* Empty state - no panels registered */}
      </div>
    );
  }

  if (!mounted) {
    return <div ref={containerRef} className={className} style={style} />;
  }

  return (
    <div ref={containerRef} className={className} style={style}>
      <Responsive
        layouts={reactGridLayouts}
        breakpoints={layout.breakpoints || DEFAULT_BREAKPOINTS}
        cols={layout.cols || DEFAULT_COLS}
        width={width}
        onLayoutChange={handleLayoutChange}
        compactType={layout.compactType || "vertical"}
        isDraggable={layout.isDraggable !== false}
        isResizable={layout.isResizable !== false}
        margin={layout.margin || [8, 8]}
        containerPadding={layout.containerPadding || [0, 0]}
      >
        {panelIds.map((panelId) => {
          const panel = panels.get(panelId);
          if (!panel) {
            console.warn(`Panel ${panelId} not found in registry`);
            return null;
          }
          return (
            <div key={panelId} style={{ width: "100%", height: "100%" }}>
              {panel}
            </div>
          );
        })}
      </Responsive>
    </div>
  );
}
