/**
 * @orderly.network/layout-split
 *
 * Split layout strategy: responsive tree-based layout with layouts per breakpoint (lg, md, sm, xs, xxs).
 * Provides split-pane layout with resizable panels using react-resizable-panels (Resizable).
 */

export { splitStrategy } from "./splitStrategy";
export { SplitLayout } from "./components/SplitLayout";
export type {
  SplitLayoutProps,
  PanelConstraints,
} from "./components/SplitLayout";

export type {
  SplitLayoutModel,
  SplitLayoutNode,
  SplitLayoutRuleNode,
  SplitLayoutRule,
  SplitLayoutPreset,
  SplitLayoutBreakpointKey,
  SplitLayoutBreakpoints,
  SplitLayoutChildConstraints,
} from "./types";

export {
  createDefaultSplitLayout,
  createDefaultSplitLayoutFromRule,
  buildSplitLayoutFromRule,
  normalizeRuleNodeToRuntime,
  getSortableIdForChild,
  updateOrderAtPath,
  serializeSplitLayout,
  deserializeSplitLayout,
} from "./utils/splitLayoutUtils";
export { getDefaultSplitPresets } from "./utils/defaultPresets";
export {
  createTradingSplitLayout,
  type TradingSplitLayoutOptions,
} from "./utils/tradingSplitLayout";

export {
  SplitPresetProvider,
  useSplitPresetContext,
} from "./SplitPresetContext";
export type {
  SplitPresetContextValue,
  SplitPresetProviderProps,
} from "./SplitPresetContext";

export {
  registerLayoutSplitPlugin,
  type LayoutSplitPluginOptions,
  type ResolveSplitLayoutPresets,
} from "./plugin";
export {
  SplitTradingDesktopChrome,
  type SplitTradingDesktopChromeProps,
} from "./components/SplitTradingDesktopChrome";

export { DEFAULT_SPLIT_BREAKPOINTS, SPLIT_BREAKPOINT_ORDER } from "./constants";
