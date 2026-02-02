import React, { useMemo, useCallback } from "react";
import type {
  LayoutRendererProps,
  PanelRegistry,
} from "@orderly.network/layout-core";
import { SplitLayout } from "./components/SplitLayout";
import type { SplitLayoutModel, SplitLayoutNode } from "./types";

/**
 * Deep clone and update sizes at a specific path in the split tree
 * @param node - The root node
 * @param path - Array of indices representing the path to the target split
 * @param newSize - The new size value
 * @returns Updated node (immutable update)
 */
function updateSizeAtPath(
  node: SplitLayoutNode,
  path: number[],
  newSize: string,
): SplitLayoutNode {
  // If we've reached the target (path is empty), update the size
  if (node.type === "panel") {
    return { ...node, size: newSize };
  }

  // Clone the split node
  const updatedNode: SplitLayoutNode = {
    ...node,
    children: [...node.children],
    sizes: node.sizes ? [...node.sizes] : undefined,
  };

  // If path is empty, this is the split we need to update sizes for
  if (path.length === 0) {
    // Store the new size - the first child's percentage
    updatedNode.sizes = updatedNode.sizes || [];
    updatedNode.sizes[0] = newSize;
    return updatedNode;
  }

  // Otherwise, recurse into the child at path[0]
  const [childIndex, ...restPath] = path;
  if (childIndex < updatedNode.children.length) {
    updatedNode.children[childIndex] = updateSizeAtPath(
      updatedNode.children[childIndex],
      restPath,
      newSize,
    );
  }

  return updatedNode;
}

/**
 * Props for internal split node rendering
 */
interface RenderSplitNodeProps {
  node: SplitLayoutNode;
  panels: PanelRegistry;
  path: number[];
  onSizeChange: (path: number[], size: string) => void;
}

/**
 * Render a single split layout node
 */
function SplitNodeRenderer({
  node,
  panels,
  path,
  onSizeChange,
}: RenderSplitNodeProps): React.ReactElement | null {
  if (node.type === "panel") {
    const panel = panels.get(node.panelId);
    if (!panel) {
      console.warn(`Panel ${node.panelId} not found in registry`);
      return null;
    }
    // Wrap panel in a div to ensure it can receive styles from SplitLayout
    return <>{panel}</>;
  }

  // node.type === "split"
  const { mode, children, sizes } = node;

  return (
    <SplitLayout
      mode={mode}
      onSizeChange={(size) => {
        // Notify parent with the path to this split
        onSizeChange(path, size);
      }}
    >
      {children.map((child, index) => (
        <SplitNodeRenderer
          key={`child-${index}`}
          node={child}
          panels={panels}
          path={[...path, index]}
          onSizeChange={onSizeChange}
        />
      ))}
    </SplitLayout>
  );
}

/**
 * Split layout renderer component
 * Renders a split layout tree based on the layout model
 */
export function SplitRenderer(
  props: LayoutRendererProps<SplitLayoutModel>,
): React.ReactElement {
  const { layout, panels, onLayoutChange, className, style } = props;

  // Handle size change at a specific path
  const handleSizeChange = useCallback(
    (path: number[], size: string) => {
      // Create updated layout with new size at the specified path
      const updatedRoot = updateSizeAtPath(layout.root, path, size);
      const updatedLayout: SplitLayoutModel = {
        ...layout,
        root: updatedRoot,
      };
      onLayoutChange(updatedLayout);
    },
    [layout, onLayoutChange],
  );

  // Handle empty panels
  if (panels.size === 0) {
    return (
      <div className={className} style={style}>
        {/* Empty state - no panels registered */}
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <SplitNodeRenderer
        node={layout.root}
        panels={panels}
        path={[]}
        onSizeChange={handleSizeChange}
      />
    </div>
  );
}
