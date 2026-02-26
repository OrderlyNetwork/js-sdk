/**
 * LocalStorage keys for grid layout preset selection and per-preset layout persistence.
 */

/** Key for the currently selected preset id (used when grid strategy is active). */
export const GRID_PRESET_ID_STORAGE_KEY = "orderly_trading_desktop_grid_preset";

/** Base key for persisting layout per preset; actual key is `${GRID_LAYOUT_STORAGE_KEY_PREFIX}_${presetId}`. */
export const GRID_LAYOUT_STORAGE_KEY_PREFIX =
  "orderly_trading_desktop_layout_grid";
