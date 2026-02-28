import React, { useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { PanelRegistry } from "@orderly.network/layout-core";
import type { SplitLayoutModel, SplitLayoutNode } from "../types";
import {
  getSortableIdForChild,
  updateOrderAtPath,
} from "../utils/splitLayoutUtils";
import type { SplitNodeRendererProps } from "./SplitNodeRenderer";
import { SplitNodeRenderer } from "./SplitNodeRenderer";

/** Props for sortable child wrapper (needs sort context props for nested sort/split). */
interface SortableSortChildProps extends SplitNodeRendererProps {
  id: string;
  child: SplitLayoutNode;
}

/**
 * Wraps a panel in a sortable drag handle for use inside a sort container.
 */
function SortableSortChild({
  id,
  child,
  panels,
  path,
  onSizeChange,
  rootNode,
  breakpoint,
  layout,
  onLayoutChange,
}: SortableSortChildProps): React.ReactElement {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="oui-relative">
      {child.type === "panel" ? (
        <div
          {...attributes}
          {...listeners}
          className="oui-absolute oui-right-1 oui-top-2 oui-z-10 oui-cursor-grab oui-opacity-50 hover:oui-opacity-100"
          style={{ touchAction: "none" }}
        >
          <span className="oui-text-base-contrast-60">⋮⋮</span>
        </div>
      ) : null}
      <div className={isDragging ? "oui-opacity-50" : ""}>
        <SplitNodeRenderer
          node={child}
          panels={panels}
          path={path}
          onSizeChange={onSizeChange}
          rootNode={rootNode}
          breakpoint={breakpoint}
          layout={layout}
          onLayoutChange={onLayoutChange}
        />
      </div>
    </div>
  );
}

/** Props for sort container renderer (node is narrowed to sort type). */
export interface SortNodeRendererProps {
  node: Extract<SplitLayoutNode, { type: "sort" }>;
  panels: PanelRegistry;
  path: number[];
  rootNode: SplitLayoutNode;
  breakpoint: keyof SplitLayoutModel["layouts"];
  layout: SplitLayoutModel;
  onSizeChange: (path: number[], sizes: string[]) => void;
  onLayoutChange: (layout: SplitLayoutModel) => void;
}

/**
 * Renders a sort container: vertical or horizontal list of sortable panels.
 */
export function SortNodeRenderer({
  node,
  panels,
  path,
  onSizeChange,
  rootNode,
  breakpoint,
  layout,
  onLayoutChange,
}: SortNodeRendererProps): React.ReactElement {
  const { orientation, children } = node;
  const items = children.map((child: SplitLayoutNode, index: number) =>
    getSortableIdForChild(child, path, index),
  );
  const isVertical = orientation === "vertical";

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return;

      const newOrder = arrayMove(
        children as SplitLayoutNode[],
        oldIndex,
        newIndex,
      ) as SplitLayoutNode[];

      const updatedRoot = updateOrderAtPath(rootNode, path, newOrder);

      onLayoutChange({
        ...layout,
        layouts: {
          ...layout.layouts,
          [breakpoint]: updatedRoot,
        },
      });
    },
    [children, items, path, rootNode, breakpoint, layout, onLayoutChange],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const strategy = isVertical
    ? verticalListSortingStrategy
    : horizontalListSortingStrategy;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={isVertical ? [restrictToVerticalAxis] : []}
    >
      <SortableContext items={items} strategy={strategy}>
        <div
          className={
            isVertical
              ? "oui-flex oui-w-full oui-flex-col oui-gap-2"
              : "oui-flex oui-w-full oui-flex-row oui-gap-2"
          }
        >
          {children.map((child: SplitLayoutNode, index: number) => (
            <SortableSortChild
              key={getSortableIdForChild(child, path, index)}
              id={getSortableIdForChild(child, path, index)}
              child={child}
              node={node}
              panels={panels}
              path={[...path, index]}
              onSizeChange={onSizeChange}
              rootNode={rootNode}
              breakpoint={breakpoint}
              layout={layout}
              onLayoutChange={onLayoutChange}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
