import type React from "react";
import type { LayoutModel, LayoutStrategy } from "@orderly.network/layout-core";

/**
 * Desktop layout props for split layout.
 * This is a local type definition to avoid circular dependency with @orderly.network/trading.
 * Contains the properties used by split layout components.
 */
export interface DesktopLayoutProps {
  className?: string;
  isSM?: boolean;
  tradingViewFullScreen?: boolean;
  showPositionIcon?: boolean;
  sortableItems?: string[];
  setSortableItems?: (items: string[]) => void;
  symbol?: string;
  layoutStrategy?: LayoutStrategy;
  storageKey?: string;
  [key: string]: unknown;
}

/** Breakpoint keys for responsive split layout (viewport-based). */
export type SplitLayoutBreakpointKey = "lg" | "md" | "sm" | "xs";

/**
 * Constraints shared by panel and split-child nodes (size per child).
 * minSize/maxSize use "%" format, e.g. "20%", "80%".
 */
export interface SplitLayoutChildConstraints {
  /** Default size, e.g. "40%", "auto" */
  size?: string;
  /** Minimum size in "%" format, e.g. "20%" */
  minSize?: string;
  /** Maximum size in "%" format, e.g. "80%" */
  maxSize?: string;
  /** When true, panel cannot be resized (maps to ResizablePanel disabled) */
  disabled?: boolean;
  /** When true, panel can be collapsed/expanded by user */
  collapsible?: boolean;
  /** When true, panel is initially collapsed */
  defaultCollapsed?: boolean;
  /** Panel title displayed in collapsible header */
  title?: string;
}

/**
 * Split layout node: single panel, split container, or sort container.
 * Used for both runtime rendering and preset rules.
 * Panel identifier is kept as `id` (same as rule) with no conversion.
 */
export type SplitLayoutNode =
  | ({
      type: "panel";
      /** Panel ID; same key as in rule (no id→panelId conversion). */
      id: string;
      /** Optional class name applied to the outer panel wrapper. */
      className?: string;
      /** Optional inline style applied to the outer panel wrapper. */
      style?: React.CSSProperties;
    } & SplitLayoutChildConstraints)
  | ({
      type: "split";
      orientation: "horizontal" | "vertical";
      /** Children; each has size/minSize/maxSize/disabled. sizes derived from children. */
      children: SplitLayoutNode[];
      /** @deprecated Legacy: sizes on split. Migrated to children[].size on read. */
      sizes?: string[];
      /** Size of this split when used as a child (e.g. "30%", "auto"). Used by parent SplitLayout for ResizablePanel. */
      size?: string;
    } & Partial<SplitLayoutChildConstraints>)
  | ({
      type: "sort";
      /** Layout orientation for the sortable list (vertical = list, horizontal = row). */
      orientation: "horizontal" | "vertical";
      /** Sortable panel children; order can be changed via drag-and-drop. */
      children: SplitLayoutNode[];
      /** Size of this sort when used as a child (e.g. "30%", "auto"). Used by parent SplitLayout for ResizablePanel. */
      size?: string;
    } & Partial<SplitLayoutChildConstraints>);

/**
 * Rule tree node: same structure as SplitLayoutNode, used for preset rules.
 * Runtime layout keeps the same `id` (no conversion).
 */
export type SplitLayoutRuleNode = SplitLayoutNode;

/**
 * Layout rule: one tree per breakpoint; missing breakpoints fall back to default.
 */
export interface SplitLayoutRule {
  lg?: SplitLayoutRuleNode;
  md?: SplitLayoutRuleNode;
  sm?: SplitLayoutRuleNode;
  xs?: SplitLayoutRuleNode;
}

/** One named preset for user selection (like grid). */
export interface SplitLayoutPreset {
  id: string;
  name: string;
  rule: SplitLayoutRule;
}

/** Breakpoint width map (min width for each key). */
export interface SplitLayoutBreakpoints {
  lg: number;
  md: number;
  sm: number;
  xs: number;
}

/**
 * Split layout model (responsive only).
 * layouts: one tree per breakpoint; renderer picks by current viewport width.
 * Aligned with GridLayoutModel.layouts naming.
 */
export interface SplitLayoutModel extends LayoutModel {
  layouts: {
    lg: SplitLayoutNode;
    md: SplitLayoutNode;
    sm: SplitLayoutNode;
    xs: SplitLayoutNode;
  };
  breakpoints: SplitLayoutBreakpoints;
}
