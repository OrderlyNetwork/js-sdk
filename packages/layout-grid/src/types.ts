import type { LayoutItem } from "react-grid-layout";
import type { LayoutModel } from "@orderly.network/layout-core";

/** Breakpoint keys aligned with GridLayoutModel.layouts */
export type GridLayoutBreakpointKey = "lg" | "md" | "sm" | "xs" | "xxs";

/**
 * Single cell layout spec (position and size only; used in rule config).
 * Does not include `i`; that is set from panelId when building GridLayoutItem.
 */
export type GridLayoutItemSpec = Omit<LayoutItem, "i"> & {
  panelId: string;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Layout rule: per-breakpoint specs for initial position and size.
 * Used by createDefaultGridLayout(panelIds, rule). Missing breakpoints fall back to lg.
 */
export interface GridLayoutRule {
  lg?: GridLayoutItemSpec[];
  md?: GridLayoutItemSpec[];
  sm?: GridLayoutItemSpec[];
  xs?: GridLayoutItemSpec[];
  xxs?: GridLayoutItemSpec[];
}

/**
 * One named layout preset for end-user selection.
 * Multiple presets form the "layouts" array (built-in or resolved by plugin options).
 */
export interface GridLayoutPreset {
  id: string;
  name: string;
  rule: GridLayoutRule;
  /** Row height in pixels - smaller values = finer grid adjustment */
  rowHeight?: number;
}

/**
 * Grid layout item configuration
 * Extends react-grid-layout LayoutItem with panel ID
 */
export interface GridLayoutItem extends LayoutItem {
  /** Panel ID to render */
  panelId: string;
}

/**
 * Grid layout model
 * Contains responsive layouts for different breakpoints
 */
export interface GridLayoutModel extends LayoutModel {
  /** Layouts for different breakpoints */
  layouts: {
    lg?: GridLayoutItem[];
    md?: GridLayoutItem[];
    sm?: GridLayoutItem[];
    xs?: GridLayoutItem[];
    xxs?: GridLayoutItem[];
  };
  /** Breakpoint definitions (optional, will use defaults if not provided) */
  breakpoints?: {
    lg: number;
    md: number;
    sm: number;
    xs: number;
    xxs: number;
  };
  /** Column definitions for each breakpoint (optional, will use defaults if not provided) */
  cols?: {
    lg: number;
    md: number;
    sm: number;
    xs: number;
    xxs: number;
  };
  /** Compact type: 'vertical' | 'horizontal' | null */
  compactType?: "vertical" | "horizontal" | null;
  /** Whether layout is draggable */
  isDraggable?: boolean;
  /** Whether layout is resizable */
  isResizable?: boolean;
  /** Margin between items [x, y] */
  margin?: [number, number];
  /** Container padding [x, y] */
  containerPadding?: [number, number];
  /** Row height in pixels - smaller values = finer grid adjustment (default: 30) */
  rowHeight?: number;
}
