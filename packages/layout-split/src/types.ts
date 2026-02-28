import type React from "react";
import type { LayoutModel } from "@orderly.network/layout-core";

/** Breakpoint keys for responsive split layout (aligned with grid). */
export type SplitLayoutBreakpointKey = "lg" | "md" | "sm" | "xs" | "xxs";

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
}

/**
 * Split layout node (runtime): single panel, split container, or sort container.
 * Used when rendering; built from rule nodes via normalizeRuleNodeToRuntime.
 */
export type SplitLayoutNode =
  | ({
      type: "panel";
      panelId: string;
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
    } & Partial<SplitLayoutChildConstraints>)
  | ({
      type: "sort";
      /** Layout orientation for the sortable list (vertical = list, horizontal = row). */
      orientation: "horizontal" | "vertical";
      /** Sortable panel children; order can be changed via drag-and-drop. */
      children: SplitLayoutNode[];
    } & Partial<SplitLayoutChildConstraints>);

/**
 * Rule tree node (low-code style): orientation + id for panels.
 * At build time orientation → orientation, id → panelId.
 */
export type SplitLayoutRuleNode =
  | ({
      type: "panel";
      /** Panel ID; alias panelId also supported */
      id: string;
      /** Optional class name applied to the outer panel wrapper for this rule. */
      className?: string;
      /** Optional inline style applied to the outer panel wrapper for this rule. */
      style?: React.CSSProperties;
    } & SplitLayoutChildConstraints)
  | ({
      type: "split";
      orientation: "horizontal" | "vertical";
      children: SplitLayoutRuleNode[];
      /** @deprecated Legacy: use size on each child instead. */
      sizes?: string[];
    } & Partial<SplitLayoutChildConstraints>)
  | ({
      type: "sort";
      /** Layout orientation for the sortable list (vertical = list, horizontal = row). */
      orientation: "horizontal" | "vertical";
      /** Sortable panel children; order can be changed via drag-and-drop. */
      children: SplitLayoutRuleNode[];
    } & Partial<SplitLayoutChildConstraints>);

/**
 * Layout rule: one tree per breakpoint; missing breakpoints fall back to lg.
 */
export interface SplitLayoutRule {
  lg?: SplitLayoutRuleNode;
  md?: SplitLayoutRuleNode;
  sm?: SplitLayoutRuleNode;
  xs?: SplitLayoutRuleNode;
  xxs?: SplitLayoutRuleNode;
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
  xxs: number;
}

/**
 * Split layout model (responsive only).
 * layouts: one tree per breakpoint; renderer picks by current width.
 * Aligned with GridLayoutModel.layouts naming.
 */
export interface SplitLayoutModel extends LayoutModel {
  layouts: {
    lg: SplitLayoutNode;
    md: SplitLayoutNode;
    sm: SplitLayoutNode;
    xs: SplitLayoutNode;
    xxs: SplitLayoutNode;
  };
  breakpoints: SplitLayoutBreakpoints;
}
