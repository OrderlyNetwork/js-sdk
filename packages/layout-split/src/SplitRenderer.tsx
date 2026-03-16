import React, { useRef, useCallback, useMemo } from "react";
import type { LayoutRendererProps } from "@orderly.network/layout-core";
import { SplitLayoutConfigProvider } from "./SplitLayoutConfigContext";
import { useSplitPresetContext } from "./SplitPresetContext";
import { SplitNodeRenderer } from "./components/SplitNodeRenderer";
import { BREAKPOINT_KEYS } from "./constants";
import { useViewportBreakpoint } from "./hooks/useViewportBreakpoint";
import type { SplitLayoutModel, SplitLayoutNode } from "./types";
import {
  getNodeAtPath,
  getSizesFromChildren,
  sizesAreEqual,
  updateSizeAtPath,
  updateDefaultCollapsedAtPath,
} from "./utils/splitRendererUtils";

/**
 * Recursively collect panel IDs that are collapsible.
 */
function getCollapsiblePanels(node: SplitLayoutNode): Map<string, boolean> {
  const collapsible = new Map<string, boolean>();

  const traverse = (n: SplitLayoutNode) => {
    if (n.type === "panel" && n.id) {
      collapsible.set(n.id, n.collapsible ?? false);
    }
    if (n.type === "split" || n.type === "sort") {
      for (const child of n.children ?? []) {
        traverse(child);
      }
    }
  };

  traverse(node);
  return collapsible;
}

/**
 * Creates an updated layout with new sizes at the given path.
 */
function createUpdatedLayout(
  rootNode: SplitLayoutNode,
  layout: SplitLayoutModel,
  breakpoint: string,
  path: number[],
  sizes: string[],
): SplitLayoutModel {
  const updatedRoot = updateSizeAtPath(rootNode, path, sizes);
  return {
    ...layout,
    layouts: {
      ...layout.layouts,
      [breakpoint]: updatedRoot,
    },
  };
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
  const presetName = ctx?.presets?.find(
    (p) => p.id === ctx?.selectedPresetId,
  )?.name;
  const breakpoint = useViewportBreakpoint({
    fallbackWidth: typeof window !== "undefined" ? window.innerWidth : 1440,
  });

  const rootNode = layout.layouts[breakpoint];

  const computeUpdatedLayout = useCallback(
    (path: number[], sizes: string[]) => {
      const nodeAtPath = getNodeAtPath(rootNode, path);
      const currentSizes =
        nodeAtPath?.type === "split"
          ? getSizesFromChildren(nodeAtPath.children)
          : undefined;
      if (sizesAreEqual(currentSizes, sizes)) {
        return null;
      }
      return createUpdatedLayout(rootNode, layout, breakpoint, path, sizes);
    },
    [layout, breakpoint, rootNode],
  );

  const handleSizeChange = useCallback(
    (path: number[], sizes: string[]) => {
      const updatedLayout = computeUpdatedLayout(path, sizes);
      if (updatedLayout) {
        onLayoutChange(updatedLayout);
      }
    },
    [computeUpdatedLayout, onLayoutChange],
  );

  const handleSizePersist = useCallback(
    (path: number[], sizes: string[]) => {
      if (!onLayoutPersist) return;
      const updatedLayout = computeUpdatedLayout(path, sizes);
      if (updatedLayout) {
        onLayoutPersist(updatedLayout);
      }
    },
    [computeUpdatedLayout, onLayoutPersist],
  );

  const collapsiblePanels = useMemo(
    () => getCollapsiblePanels(rootNode),
    [rootNode],
  );

  const collapsedPanels = useMemo(() => {
    const collapsed = new Set<string>();
    const traverse = (node: SplitLayoutNode) => {
      if (node.type === "panel" && node.id && node.defaultCollapsed) {
        collapsed.add(node.id);
      }
      if (node.type === "split" || node.type === "sort") {
        node.children?.forEach(traverse);
      }
    };
    traverse(rootNode);
    return collapsed;
  }, [rootNode]);

  const computeUpdatedLayoutForCollapse = useCallback(
    (panelId: string, collapsed: boolean) => {
      const updatedLayouts: SplitLayoutModel["layouts"] = {} as any;
      for (const bp of BREAKPOINT_KEYS) {
        if (layout.layouts[bp]) {
          updatedLayouts[bp] = updateDefaultCollapsedAtPath(
            layout.layouts[bp],
            panelId,
            collapsed,
          );
        }
      }
      return { ...layout, layouts: updatedLayouts };
    },
    [layout],
  );

  const isPanelCollapsible = useCallback(
    (panelId: string) => collapsiblePanels.get(panelId) ?? false,
    [collapsiblePanels],
  );

  const togglePanelCollapse = useCallback(
    (panelId: string) => {
      const isCurrentlyCollapsed = collapsedPanels.has(panelId);
      const updatedLayout = computeUpdatedLayoutForCollapse(
        panelId,
        !isCurrentlyCollapsed,
      );
      onLayoutChange(updatedLayout);
      onLayoutPersist?.(updatedLayout);
    },
    [
      collapsedPanels,
      computeUpdatedLayoutForCollapse,
      onLayoutChange,
      onLayoutPersist,
    ],
  );

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
    <div ref={containerRef} className={className}>
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
      <div
        className="oui-fixed oui-right-2 oui-bottom-5 oui-text-lg oui-text-trade-loss oui-flex oui-flex-col oui-items-end"
        style={{ zIndex: 1000 }}
      >
        <span>{breakpoint}</span>
        {presetName && <span className="oui-text-sm">{presetName}</span>}
        <button
          onClick={() => ctx?.reset()}
          className="oui-mt-1 oui-px-2 oui-py-1 oui-text-sm oui-bg-gray-500 oui-text-white oui-rounded"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
