import React, { useRef, useCallback } from "react";
import type { LayoutRendererProps } from "@orderly.network/layout-core";
import { useSplitPresetContext } from "./SplitPresetContext";
import { SplitNodeRenderer } from "./components/SplitNodeRenderer";
import { useBreakpointFromWidth } from "./hooks/useBreakpointFromWidth";
import type { SplitLayoutModel } from "./types";
import {
  getNodeAtPath,
  getSizesFromChildren,
  sizesAreEqual,
  updateSizeAtPath,
} from "./utils/splitRendererUtils";

/**
 * Split layout renderer: picks root by current breakpoint (from container width),
 * renders that tree, and on size change updates only the current breakpoint's root.
 */
export function SplitRenderer(
  props: LayoutRendererProps<SplitLayoutModel>,
): React.ReactElement {
  const { layout, panels, onLayoutChange, className, style } = props;

  const ctx = useSplitPresetContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const breakpoint = useBreakpointFromWidth(containerRef, {
    breakpoints: layout.breakpoints,
    fallbackWidth: layout.breakpoints.lg,
  });

  const rootNode = layout.layouts[breakpoint] ?? layout.layouts.lg;

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
      onLayoutChange(updatedLayout);
    },
    [layout, breakpoint, rootNode, onLayoutChange],
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
      <SplitNodeRenderer
        node={rootNode}
        panels={panels}
        path={[]}
        onSizeChange={handleSizeChange}
        rootNode={rootNode}
        breakpoint={breakpoint}
        layout={layout}
        onLayoutChange={onLayoutChange}
        classNames={ctx?.classNames}
        gap={ctx?.gap}
      />
    </div>
  );
}
