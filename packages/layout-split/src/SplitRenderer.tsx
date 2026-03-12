import React, { useRef, useCallback, useState, useMemo } from "react";
import type { LayoutRendererProps } from "@orderly.network/layout-core";
import { SplitLayoutConfigProvider } from "./SplitLayoutConfigContext";
import { useSplitPresetContext } from "./SplitPresetContext";
import { SplitNodeRenderer } from "./components/SplitNodeRenderer";
import { useViewportBreakpoint } from "./hooks/useViewportBreakpoint";
import type { SplitLayoutModel, SplitLayoutNode } from "./types";
import {
  getNodeAtPath,
  getSizesFromChildren,
  sizesAreEqual,
  updateSizeAtPath,
} from "./utils/splitRendererUtils";

/**
 * Recursively collect panel IDs that have defaultCollapsed: true.
 */
function getDefaultCollapsedPanels(node: SplitLayoutNode): string[] {
  const collapsed: string[] = [];
  if (node.type === "panel" && node.id && node.defaultCollapsed) {
    collapsed.push(node.id);
  }
  if (node.type === "split" || node.type === "sort") {
    for (const child of node.children ?? []) {
      collapsed.push(...getDefaultCollapsedPanels(child));
    }
  }
  return collapsed;
}

/**
 * Recursively collect panel IDs that have collapsible: true.
 */
function getCollapsiblePanels(node: SplitLayoutNode): Map<string, boolean> {
  const collapsible = new Map<string, boolean>();
  if (node.type === "panel" && node.id) {
    collapsible.set(node.id, node.collapsible ?? false);
  }
  if (node.type === "split" || node.type === "sort") {
    for (const child of node.children ?? []) {
      const childCollapsible = getCollapsiblePanels(child);
      childCollapsible.forEach((value, key) => {
        collapsible.set(key, value);
      });
    }
  }
  return collapsible;
}

/**
 * Split layout renderer: picks root by current breakpoint (from viewport width),
 * renders that tree, and on size change updates only the current breakpoint's root.
 */
export function SplitRenderer(
  props: LayoutRendererProps<SplitLayoutModel>,
): React.ReactElement {
  const { layout, panels, onLayoutChange, onLayoutPersist, className, style } =
    props;

  const ctx = useSplitPresetContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const breakpoint = useViewportBreakpoint({
    fallbackWidth: typeof window !== "undefined" ? window.innerWidth : 1440,
  });

  const rootNode = layout.layouts[breakpoint] ?? layout.layouts.default;

  const handleSizeChange = useCallback(
    (path: number[], sizes: string[]) => {
      const nodeAtPath = getNodeAtPath(rootNode, path);
      const currentSizes =
        nodeAtPath?.type === "split"
          ? getSizesFromChildren(nodeAtPath.children)
          : undefined;
      if (sizesAreEqual(currentSizes, sizes)) {
        return;
      }
      const updatedRoot = updateSizeAtPath(rootNode, path, sizes);
      const updatedLayout: SplitLayoutModel = {
        ...layout,
        layouts: {
          ...layout.layouts,
          [breakpoint]: updatedRoot,
        },
      };
      // Update UI state only (no persistence)
      onLayoutChange(updatedLayout);
    },
    [layout, breakpoint, rootNode, onLayoutChange],
  );

  const handleSizePersist = useCallback(
    (path: number[], sizes: string[]) => {
      if (!onLayoutPersist) return;
      const nodeAtPath = getNodeAtPath(rootNode, path);
      const currentSizes =
        nodeAtPath?.type === "split"
          ? getSizesFromChildren(nodeAtPath.children)
          : undefined;
      if (sizesAreEqual(currentSizes, sizes)) {
        return;
      }
      const updatedRoot = updateSizeAtPath(rootNode, path, sizes);
      const updatedLayout: SplitLayoutModel = {
        ...layout,
        layouts: {
          ...layout.layouts,
          [breakpoint]: updatedRoot,
        },
      };
      // Persist layout to storage
      onLayoutPersist(updatedLayout);
    },
    [layout, breakpoint, rootNode, onLayoutPersist],
  );

  // Collapse state management - initialize from defaultCollapsed in node config
  const initialCollapsed = useMemo(
    () => new Set(getDefaultCollapsedPanels(rootNode)),
    [rootNode],
  );
  const [collapsedPanels, setCollapsedPanels] =
    useState<Set<string>>(initialCollapsed);

  // Collect collapsible panels from node config
  const collapsiblePanels = useMemo(
    () => getCollapsiblePanels(rootNode),
    [rootNode],
  );

  const isPanelCollapsible = useCallback(
    (panelId: string) => collapsiblePanels.get(panelId) ?? false,
    [collapsiblePanels],
  );

  const togglePanelCollapse = useCallback((panelId: string) => {
    setCollapsedPanels((prev) => {
      const next = new Set(prev);
      if (next.has(panelId)) {
        next.delete(panelId);
      } else {
        next.add(panelId);
      }
      return next;
    });
  }, []);

  const isPanelCollapsed = useCallback(
    (panelId: string) => collapsedPanels.has(panelId),
    [collapsedPanels],
  );

  if (panels.size === 0) {
    return (
      <div ref={containerRef} className={className} style={style}>
        {/* Empty state - no panels registered */}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ ...style, width: "100%", minWidth: 0 }}
    >
      <SplitLayoutConfigProvider
        panels={panels}
        layout={layout}
        breakpoint={breakpoint}
        onLayoutChange={onLayoutChange}
        onSizeChange={handleSizeChange}
        onSizePersist={handleSizePersist}
        classNames={ctx?.classNames}
        gap={ctx?.gap}
        collapsedPanels={collapsedPanels}
        togglePanelCollapse={togglePanelCollapse}
        isPanelCollapsed={isPanelCollapsed}
        collapsiblePanels={collapsiblePanels}
        isPanelCollapsible={isPanelCollapsible}
      >
        <SplitNodeRenderer node={rootNode} path={[]} rootNode={rootNode} />
      </SplitLayoutConfigProvider>
    </div>
  );
}
