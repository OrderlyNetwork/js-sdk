/**
 * @orderly.network/layout-grid
 *
 * Grid layout strategy implementation for Orderly layout system.
 * Provides responsive grid layout with draggable and resizable panels using react-grid-layout.
 */
// Import CSS for react-grid-layout
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

// Strategy
export { gridStrategy } from "./gridStrategy";

// Types
export type {
  GridLayoutModel,
  GridLayoutItem,
  GridLayoutRule,
  GridLayoutItemSpec,
  GridLayoutBreakpointKey,
  GridLayoutPreset,
} from "./types";

// Utils
export {
  createDefaultGridLayout,
  serializeGridLayout,
  deserializeGridLayout,
  DEFAULT_BREAKPOINTS,
  DEFAULT_COLS,
} from "./utils/gridLayoutUtils";
export {
  createTradingGridLayout,
  TRADING_GRID_PANEL_IDS,
} from "./utils/tradingGridLayout";
export {
  getDefaultGridPresets,
  DEFAULT_GRID_PRESETS,
} from "./utils/defaultPresets";

// Preset context and switcher (for use when grid plugin is active)
export { GridPresetProvider, useGridPresetContext } from "./GridPresetContext";
export type { GridPresetContextValue } from "./GridPresetContext";
export { GridLayoutSwitcher } from "./GridLayoutSwitcher";
export type { GridLayoutSwitcherProps } from "./GridLayoutSwitcher";

/** Grid layout plugin: register to use grid layout via intercept (no layoutStrategy/getInitialLayout from host) */
export {
  registerLayoutGridPlugin,
  type LayoutGridPluginOptions,
  type ResolveLayoutPresets,
} from "./plugin";
