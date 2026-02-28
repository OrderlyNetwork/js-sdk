import React from "react";
import type { PanelRegistry } from "@orderly.network/layout-core";
import { cn } from "@orderly.network/ui";
import type { SplitLayoutModel, SplitLayoutNode } from "../types";
import { SortNodeRenderer } from "./SortNodeRenderer";
import { SplitLayout } from "./SplitLayout";

/** Shared props for recursively rendering a split layout node tree. */
export interface SplitNodeRendererProps {
  node: SplitLayoutNode;
  panels: PanelRegistry;
  path: number[];
  onSizeChange: (path: number[], sizes: string[]) => void;
  rootNode: SplitLayoutNode;
  breakpoint: keyof SplitLayoutModel["layouts"];
  layout: SplitLayoutModel;
  onLayoutChange: (layout: SplitLayoutModel) => void;
}

/**
 * Recursively renders a split layout node:
 * - panel: renders panel from registry
 * - sort: renders sortable container
 * - split: renders resizable SplitLayout with nested children
 */
export function SplitNodeRenderer({
  node,
  panels,
  path,
  onSizeChange,
  rootNode,
  breakpoint,
  layout,
  onLayoutChange,
}: SplitNodeRendererProps): React.ReactElement | null {
  if (node.type === "panel") {
    const panel = panels.get(node.panelId);
    if (!panel) return null;
    /** Wrap panel content so layout can attach per-panel styling via rule. */
    return (
      <div
        className={cn(
          node.size !== "fixed" ? "oui-size-full" : "",
          node.className,
        )}
        style={node.style}
        data-panel-id={node.panelId}
      >
        {panel}
      </div>
    );
  }

  if (node.type === "sort") {
    return (
      <SortNodeRenderer
        node={node as Extract<SplitLayoutNode, { type: "sort" }>}
        panels={panels}
        path={path}
        onSizeChange={onSizeChange}
        rootNode={rootNode}
        breakpoint={breakpoint}
        layout={layout}
        onLayoutChange={onLayoutChange}
      />
    );
  }

  // type === "split"
  const { orientation, children } = node;
  const sizes = children.map((child) => child.size ?? "auto");
  const panelConstraints = children.map((child) => ({
    minSize: child.minSize,
    maxSize: child.maxSize,
    disabled: child.disabled,
  }));

  return (
    <SplitLayout
      orientation={orientation}
      sizes={sizes}
      panelConstraints={panelConstraints}
      onSizeChange={(sizesAsStrings) => onSizeChange(path, sizesAsStrings)}
    >
      {children.map((child, index) => (
        <SplitNodeRenderer
          key={`child-${index}`}
          node={child}
          panels={panels}
          path={[...path, index]}
          onSizeChange={onSizeChange}
          rootNode={rootNode}
          breakpoint={breakpoint}
          layout={layout}
          onLayoutChange={onLayoutChange}
        />
      ))}
    </SplitLayout>
  );
}
