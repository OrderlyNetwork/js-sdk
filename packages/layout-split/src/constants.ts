import type { SplitLayoutBreakpointKey, SplitLayoutBreakpoints } from "./types";

/** Breakpoint key order (largest to smallest). */
export const SPLIT_BREAKPOINT_ORDER: SplitLayoutBreakpointKey[] = [
  "lg",
  "md",
  "sm",
  "xs",
  "xxs",
];

/** Default breakpoint widths (min width in px; aligned with layout-grid). */
export const DEFAULT_SPLIT_BREAKPOINTS: SplitLayoutBreakpoints = {
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
  xxs: 0,
};

/** LocalStorage key for selected split preset id. */
export const SPLIT_PRESET_ID_STORAGE_KEY =
  "orderly_trading_desktop_split_preset";

/** Base key for per-preset layout persistence; actual key is `${SPLIT_LAYOUT_STORAGE_KEY_PREFIX}_${presetId}`. */
export const SPLIT_LAYOUT_STORAGE_KEY_PREFIX =
  "orderly_trading_desktop_layout_split";
