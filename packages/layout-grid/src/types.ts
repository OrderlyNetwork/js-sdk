import type { LayoutItem } from "react-grid-layout";
import type { LayoutModel } from "@orderly.network/layout-core";

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
}
