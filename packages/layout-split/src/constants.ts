import type { SplitLayoutBreakpointKey, SplitLayoutBreakpoints } from "./types";

/** Breakpoint key order (largest to smallest). */
export const SPLIT_BREAKPOINT_ORDER: SplitLayoutBreakpointKey[] = [
  "min3XL",
  "max4XL",
  "default",
  "max2XL",
];

/** Default breakpoint widths (min width in px; aligned with layout-grid). */
export const DEFAULT_SPLIT_BREAKPOINTS: SplitLayoutBreakpoints = {
  min3XL: 1440,
  max4XL: 1680,
  default: 1440,
  max2XL: 1279,
};

/** Viewport-based breakpoint keys for responsive split layout. */
export type ViewportBreakpointKey = "max2XL" | "default" | "min3XL" | "max4XL";

/** Viewport breakpoint values (max width in px). */
export const VIEWPORT_BREAKPOINTS: Record<ViewportBreakpointKey, number> = {
  max2XL: 1279,
  default: 1440,
  min3XL: 1440,
  max4XL: 1680,
};

/** Viewport breakpoint key order (largest to smallest). */
export const VIEWPORT_BREAKPOINT_ORDER: ViewportBreakpointKey[] = [
  "min3XL",
  "max4XL",
  "default",
  "max2XL",
];

/** LocalStorage key for selected split preset id. */
export const SPLIT_PRESET_ID_STORAGE_KEY =
  "orderly_trading_desktop_split_preset";

/** Base key for per-preset layout persistence; actual key is `${SPLIT_LAYOUT_STORAGE_KEY_PREFIX}_${presetId}`. */
export const SPLIT_LAYOUT_STORAGE_KEY_PREFIX =
  "orderly_trading_desktop_layout_split";
