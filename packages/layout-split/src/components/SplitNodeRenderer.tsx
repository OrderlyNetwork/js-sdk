import React from "react";
import { cn } from "@orderly.network/ui";
import { Flex, Text } from "@orderly.network/ui";
import { useSplitLayoutConfig } from "../SplitLayoutConfigContext";
import type { SplitLayoutNode } from "../types";
import { SortNodeRenderer } from "./SortNodeRenderer";
import { SplitLayout } from "./SplitLayout";

/** Inline SVG for collapse icon */
const CollapseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 4L6 8L10 12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Inline SVG for expand icon */
const ExpandIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 4L10 8L6 12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
  const {
    panels,
    onSizeChange,
    onSizePersist,
    classNames,
    gap,
    isPanelCollapsed,
    togglePanelCollapse,
    isPanelCollapsible,
  } = useSplitLayoutConfig();

  console.log("node", node);

  if (node.type === "panel") {
    // Check if panel is collapsed - don't render if collapsed
    // if (node.id && isPanelCollapsed(node.id)) {
    //   return null;
    // }

    const panelWrapper = panels.get(node.id);
    const panel = panelWrapper?.node;
    if (!panel) {
      /** Placeholder when panel not in registry (empty or unknown id). */
      return (
        <div
          className={cn(
            "oui-text-base-contrast-40 oui-rounded-2xl oui-bg-base-9 oui-p-3 oui-text-xs",
            node.size !== "fixed" && "oui-size-full",
            classNames?.panel,
            node.className,
          )}
          style={node.style}
          data-panel-id={node.id}
        >
          {node.id ? `Panel not found: ${node.id}` : "Panel not found"}
        </div>
      );
    }
    const styles = Object.assign(
      {},
      node.style,
      node.collapsible
        ? isPanelCollapsed(node.id)
          ? { width: node.minSize }
          : { width: node.maxSize }
        : {},
    );

    const isCollapsed = isPanelCollapsed(node.id);
    const collapsible =
      node.collapsible === true || isPanelCollapsible(node.id);
    const title = node.title ?? panelWrapper?.props?.title;

    const renderCollapsibleHeader = () => {
      if (typeof collapsible !== "undefined" && !collapsible) return null;

      return (
        <Flex
          className={cn(
            "oui-text-base-contrast-36",
            isCollapsed
              ? "oui-absolute oui-end-[-20px] oui-z-50"
              : "oui-relative",
          )}
          justify={isCollapsed ? "center" : "between"}
          width="100%"
          px={3}
          pt={3}
        >
          {!isCollapsed && title && (
            <Text size="base" intensity={80}>
              {title}
            </Text>
          )}
          <div
            onClick={() => togglePanelCollapse(node.id)}
            className={cn(
              "oui-cursor-pointer hover:oui-text-base-contrast-80",
              isCollapsed &&
                "oui-absolute oui-start-1/2 oui-transform oui-translate-x-[-50%]",
            )}
          >
            {isCollapsed ? (
              <ExpandIcon className="oui-text-base-contrast-36" />
            ) : (
              <CollapseIcon className="oui-text-base-contrast-36" />
            )}
          </div>
        </Flex>
      );
    };

    return (
      <div
        className={cn(
          "oui-overflow-hidden oui-rounded-2xl oui-bg-base-9",
          node.size !== "fixed" && "oui-size-full",
          classNames?.panel,
          node.className,
        )}
        style={styles}
        data-panel-id={node.id}
      >
        {renderCollapsibleHeader()}
        <div
          className={cn(
            collapsible && isCollapsed ? "oui-hidden" : "oui-h-full",
          )}
        >
          {panel}
        </div>
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
      onSizeChange={(sizesAsStrings) => {
        onSizeChange(path, sizesAsStrings);
        onSizePersist?.(path, sizesAsStrings);
      }}
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
