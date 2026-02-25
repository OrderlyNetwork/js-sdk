/**
 * @orderly.network/layout-grid
 *
 * Grid layout strategy implementation for Orderly layout system.
 * Provides responsive grid layout with draggable and resizable panels using react-grid-layout.
 */
// Import CSS for react-grid-layout
import "react-grid-layout/css/styles.css";

// import "react-resizable/css/styles.css";

// Strategy
export { gridStrategy } from "./gridStrategy";

// Types
export type { GridLayoutModel, GridLayoutItem } from "./types";

// Utils
export {
  createDefaultGridLayout,
  serializeGridLayout,
  deserializeGridLayout,
  DEFAULT_BREAKPOINTS,
  DEFAULT_COLS,
} from "./utils/gridLayoutUtils";
export { createTradingGridLayout } from "./utils/tradingGridLayout";

/** Grid layout plugin: register to use grid layout via intercept (no layoutStrategy/getInitialLayout from host) */
export {
  registerLayoutGridPlugin,
  type LayoutGridPluginOptions,
} from "./plugin";
