/**
 * @orderly.network/layout-split
 *
 * Split layout strategy implementation for Orderly layout system.
 * Provides split-pane layout with resizable panels using @uiw/react-split.
 */

// Strategy
export { splitStrategy } from "./splitStrategy";

// Components (for backward compatibility or direct use)
export { SplitLayout } from "./components/SplitLayout";
export type { SplitLayoutProps } from "./components/SplitLayout";
export { SplitLineBar } from "./components/SplitLineBar";
export type { SplitLineBarProps } from "./components/SplitLineBar";

// Types
export type { SplitLayoutModel, SplitLayoutNode } from "./types";

// Utils
export {
  createDefaultSplitLayout,
  serializeSplitLayout,
  deserializeSplitLayout,
} from "./utils/splitLayoutUtils";
export {
  createTradingSplitLayout,
  type TradingSplitLayoutOptions,
} from "./utils/tradingSplitLayout";
