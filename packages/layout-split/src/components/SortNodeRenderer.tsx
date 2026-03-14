import React, { useCallback, useEffect, useRef } from "react";
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
import { cn } from "@orderly.network/ui";
import { useSplitLayoutConfig } from "../SplitLayoutConfigContext";
import { useSplitPresetContext } from "../SplitPresetContext";
import type { SplitLayoutNode } from "../types";
import {
  getSortableIdForChild,
  updateOrderAtPath,
} from "../utils/splitLayoutUtils";
import { SplitNodeRenderer } from "./SplitNodeRenderer";

const DEFAULT_SHOW_INDICATOR = true;

/** Props for sortable child wrapper (needs sort context props for nested sort/split). */
interface SortableSortChildProps {
  id: string;
  child: SplitLayoutNode;
  path: number[];
  rootNode: SplitLayoutNode;
  /** When true, show drag handle on panel children; from SplitSortIndicatorContext. */
  showIndicator: boolean;
}

/** Drag handle icon (matches SortablePanel). */
function IndicatorIcon(
  props: React.SVGProps<SVGSVGElement>,
): React.ReactElement {
  return (
    <svg
      width="10"
      height="16"
      viewBox="0 0 10 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x="2" y="2" width="6" height="2" rx="1" />
      <rect x="2" y="7" width="6" height="2" rx="1" />
      <rect x="2" y="12" width="6" height="2" rx="1" />
    </svg>
  );
}

/**
 * Wraps a panel in a sortable drag handle for use inside a sort container.
 * Single wrapper div only: panel className is applied once by SplitNodeRenderer, not here.
 */
function SortableSortChild({
  id,
  child,
  showIndicator,
  path,
  rootNode,
}: SortableSortChildProps): React.ReactElement {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState<{
    width: number;
    height: number;
  } | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  useEffect(() => {
    if (isDragging && nodeRef.current && !dimensions) {
      const rect = nodeRef.current.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
    } else if (!isDragging && dimensions) {
      setDimensions(null);
    }
  }, [isDragging, dimensions]);

  const combinedRef = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    (nodeRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const showHandle = showIndicator && child.type === "panel";

  /** Placeholder: minimal styling, no panel className (avoid duplication). */
  if (isDragging && dimensions) {
    return (
      <div
        className="oui-relative oui-rounded-2xl"
        style={{
          ...style,
          width: dimensions.width,
          height: dimensions.height,
          minWidth: dimensions.width,
          minHeight: dimensions.height,
          maxWidth: dimensions.width,
          maxHeight: dimensions.height,
          border: "1px solid rgb(var(--oui-color-primary))",
          backgroundImage: `repeating-linear-gradient(135deg, rgb(var(--oui-color-base-6)) 0px, rgb(var(--oui-color-base-6)) 4px, transparent 4px, transparent 8px)`,
        }}
      />
    );
  }

  return (
    <div
      ref={combinedRef}
      style={style}
      className={cn("oui-relative", isDragging && "oui-opacity-50")}
    >
      {showHandle && (
        <button
          {...attributes}
          {...listeners}
          className="oui-absolute oui-right-0 oui-top-4 oui-cursor-move oui-py-1"
          style={{ touchAction: "none" }}
          ref={setActivatorNodeRef}
        >
          <IndicatorIcon
            className={cn(
              "oui-text-base-contrast-20 hover:oui-text-base-contrast-80",
            )}
          />
        </button>
      )}
      <SplitNodeRenderer node={child} path={path} rootNode={rootNode} />
    </div>
  );
}

/** Props for sort container renderer (node is narrowed to sort type). */
export interface SortNodeRendererProps {
  node: Extract<SplitLayoutNode, { type: "sort" }>;
  path: number[];
  rootNode: SplitLayoutNode;
}

/**
 * Renders a sort container: vertical or horizontal list of sortable panels.
 */
export function SortNodeRenderer({
  node,
  path,
  rootNode,
}: SortNodeRendererProps): React.ReactElement {
  const { onLayoutChange, layout, breakpoint } = useSplitLayoutConfig();
  const { orientation, children } = node;
  const ctx = useSplitPresetContext();
  const showIndicator = ctx?.showIndicator ?? DEFAULT_SHOW_INDICATOR;
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
    <div>
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
                showIndicator={showIndicator}
                path={[...path, index]}
                rootNode={rootNode}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
