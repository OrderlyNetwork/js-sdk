import React from "react";
import { useMemo } from "react";
import { useSplitLayoutConfig } from "../SplitLayoutConfigContext";
import type { SplitLayoutNode } from "../types";
import { SortNodeRenderer } from "./SortNodeRenderer";
import { SplitLayout } from "./SplitLayout";

/** Shared props for recursively rendering a split layout node tree. */
export interface SplitNodeRendererProps {
  node: SplitLayoutNode;
  path: number[];
  rootNode: SplitLayoutNode;
}

/**
 * Recursively renders a split layout node:
 * - panel: renders panel from registry
 * - sort: renders sortable container
 * - split: renders resizable SplitLayout with nested children
 */
export function SplitNodeRenderer({
  node,
  path,
  rootNode,
}: SplitNodeRendererProps): React.ReactElement | null {
  const { panels, onSizeChange, classNames, gap, isPanelCollapsed } =
    useSplitLayoutConfig();

  if (node.type === "panel") {
    // Check if panel is collapsed - don't render if collapsed
    if (node.id && isPanelCollapsed(node.id)) {
      return null;
    }

    const panel = panels.get(node.id);
    if (!panel) {
      /** Placeholder when panel not in registry (empty or unknown id). */
      return (
        <div
          className={
            "oui-bg-base-9 oui-rounded-2xl oui-p-3 oui-text-base-contrast-40 oui-text-xs" +
            (node.size !== "fixed" ? " oui-size-full" : "") +
            (classNames?.panel ? ` ${classNames.panel}` : "") +
            (node.className ? ` ${node.className}` : "")
          }
          style={node.style}
          data-panel-id={node.id}
        >
          {node.id ? `Panel not found: ${node.id}` : "Panel not found"}
        </div>
      );
    }
    /** Wrap panel content so layout can attach per-panel styling via rule. */
    return (
      <div
        className={
          "oui-bg-base-9 oui-rounded-2xl" +
          (node.size !== "fixed" ? " oui-size-full" : "") +
          (classNames?.panel ? ` ${classNames.panel}` : "") +
          (node.className ? ` ${node.className}` : "")
        }
        style={node.style}
        data-panel-id={node.id}
      >
        {panel}
      </div>
    );
  }

  if (node.type === "sort") {
    return (
      <SortNodeRenderer
        node={node as Extract<SplitLayoutNode, { type: "sort" }>}
        path={path}
        rootNode={rootNode}
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
      classNames={classNames}
      gap={gap}
    >
      {children.map((child, index) => (
        <SplitNodeRenderer
          key={`child-${index}`}
          node={child}
          path={[...path, index]}
          rootNode={rootNode}
        />
      ))}
    </SplitLayout>
  );
}
