/**
 * @orderly.network/layout-split
 *
 * Split layout strategy: responsive tree-based layout with layouts per viewport breakpoint (lg, md, sm, xs).
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
  DesktopLayoutProps,
} from "./types";

export {
  createDefaultSplitLayout,
  createDefaultSplitLayoutFromRule,
  buildSplitLayoutFromRule,
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
  SplitLayoutConfigProvider,
  useSplitLayoutConfig,
} from "./SplitLayoutConfigContext";
export type {
  SplitLayoutConfigValue,
  SplitLayoutConfigProviderProps,
} from "./SplitLayoutConfigContext";

export {
  registerLayoutSplitPlugin,
  type LayoutSplitPluginOptions,
  type ResolveSplitLayoutPresets,
} from "./plugin";
export {
  SplitTradingDesktopChrome,
  type SplitTradingDesktopChromeProps,
} from "./components/SplitTradingDesktopChrome";
export { SplitInlinedLayout } from "./components/SplitInlinedLayout";
export { useSplitTradingDesktopContext } from "./components/SplitTradingDesktopContext";

export {
  DEFAULT_SPLIT_BREAKPOINTS,
  SPLIT_BREAKPOINT_ORDER,
  VIEWPORT_BREAKPOINTS,
  VIEWPORT_BREAKPOINT_ORDER,
  type ViewportBreakpointKey,
} from "./constants";

export { useViewportBreakpoint } from "./hooks/useViewportBreakpoint";
