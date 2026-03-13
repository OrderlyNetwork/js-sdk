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
import { cn } from "@orderly.network/ui";
import type { GridLayoutModel, GridLayoutItem } from "./types";
import { DEFAULT_BREAKPOINTS, DEFAULT_COLS } from "./utils/gridLayoutUtils";

type BreakpointKey = "lg" | "md" | "sm" | "xs" | "xxs";
type ResponsiveLayouts = Partial<Record<string, Layout>>;

/** GridLayoutItem[] -> react-grid-layout Layout */
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

/** Responsive grid layout renderer (react-grid-layout). */
export function GridRenderer(
  props: LayoutRendererProps<GridLayoutModel>,
): React.ReactElement {
  const { layout, panels, onLayoutChange, onLayoutPersist, className, style } =
    props;
  const { width, containerRef, mounted } = useContainerWidth();

  const layoutsRef = useRef(layout.layouts);

  useEffect(() => {
    layoutsRef.current = layout.layouts;
  }, [layout.layouts]);

  const reactGridLayouts = useMemo(
    () => toReactGridLayouts(layout.layouts),
    [layout.layouts],
  );

  const handleLayoutChange = useCallback(
    (_currentLayout: Layout, allLayouts: ResponsiveLayouts) => {
      const updatedLayouts: GridLayoutModel["layouts"] = {};
      (Object.keys(allLayouts) as BreakpointKey[]).forEach((bp) => {
        const items = allLayouts[bp];
        if (items) {
          const originalItems = layout.layouts[bp] || [];
          updatedLayouts[bp] = items.map((item: LayoutItem) => {
            const originalItem = originalItems.find((i) => i.i === item.i);
            return {
              ...item,
              panelId: originalItem?.panelId || item.i,
              className: originalItem?.className,
              style: originalItem?.style,
            } as GridLayoutItem;
          });
        }
      });
      layoutsRef.current = updatedLayouts;
      onLayoutChange({ ...layout, layouts: updatedLayouts });
    },
    [layout, onLayoutChange],
  );

  const {
    layout: currentLayout,
    cols,
    breakpoint,
    setLayoutForBreakpoint,
  } = useResponsiveLayout({
    width,
    breakpoints: layout.breakpoints || DEFAULT_BREAKPOINTS,
    cols: layout.cols || DEFAULT_COLS,
    layouts: reactGridLayouts,
    onLayoutChange: handleLayoutChange,
  });

  // const handleGridLayoutChange = useCallback(
  //   (newLayout: Layout) => setLayoutForBreakpoint(breakpoint, newLayout),
  //   [breakpoint, setLayoutForBreakpoint],
  // );

  // const handlePersistLayout = useCallback(
  //   (_: Layout) => {
  //     if (onLayoutPersist) {
  //       onLayoutPersist({ ...layout, layouts: layoutsRef.current });
  //     }
  //   },
  //   [layout, onLayoutPersist],
  // );

  const layoutItems = useMemo(() => {
    const breakpoints: BreakpointKey[] = ["lg", "md", "sm", "xs", "xxs"];
    for (const bp of breakpoints) {
      const items = layout.layouts[bp];
      if (items?.length) return items;
    }
    return [];
  }, [layout.layouts]);

  const children = useMemo(
    () =>
      layoutItems.map((config) => {
        const panelId = config.panelId;
        const panelWrapper = panels.get(panelId);
        const panel = panelWrapper?.node;
        if (!panel) {
          console.warn(`Panel ${panelId} not found in registry`);
          return null;
        }
        return (
          <div
            key={panelId}
            className={cn(
              "oui-layout-grid-item oui-relative oui-size-full oui-overflow-hidden oui-rounded-2xl oui-bg-base-9",
              config.className,
            )}
            style={config.style}
          >
            {panel}
          </div>
        );
      }),
    [layoutItems, panels],
  );

  if (panels.size === 0) {
    return (
      <div
        ref={containerRef as React.RefObject<HTMLDivElement>}
        className={className}
        style={style}
      ></div>
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
      className={cn("oui-grid-layout-container oui-p-2", className)}
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
          layout.compactType === null,
        )}
        dragConfig={{
          enabled: layout.isDraggable !== false,
        }}
        resizeConfig={{
          enabled: layout.isResizable !== false,
        }}
        // onLayoutChange={handleGridLayoutChange}
        // onDragStop={handlePersistLayout}
        // onResizeStop={handlePersistLayout}
      >
        {children}
      </GridLayout>
    </div>
  );
}
