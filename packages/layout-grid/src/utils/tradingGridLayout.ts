/**
 * Default trading grid layout for LayoutHost with gridStrategy.
 * Uses TRADING_PANEL_IDS from layout-core; component mapping is in the trading package.
 * Whether MARKETS panel is included is determined by layout-grid plugin state (localStorage).
 */
import { TRADING_PANEL_IDS } from "@orderly.network/layout-core";
import type { GridLayoutModel } from "../types";
import { DEFAULT_GRID_PRESETS } from "./defaultPresets";
import { createDefaultGridLayout } from "./gridLayoutUtils";

/** localStorage key for side markets visibility; align with layout plugin–owned state */
const HORIZONTAL_MARKETS_LAYOUT_KEY = "orderly_horizontal_markets_layout";

/** Panel IDs for trading grid in display order (symbolInfoBar, tradingView, orderbook, dataList, orderEntry, markets). Exported for plugin getInitialLayout. */
export const TRADING_GRID_PANEL_IDS = [
  TRADING_PANEL_IDS.SYMBOL_INFO_BAR,
  TRADING_PANEL_IDS.TRADING_VIEW,
  TRADING_PANEL_IDS.ORDERBOOK,
  TRADING_PANEL_IDS.DATA_LIST,
  TRADING_PANEL_IDS.ORDER_ENTRY,
  TRADING_PANEL_IDS.MARKETS,
] as const;

/**
 * Returns panel IDs for the trading grid; includes MARKETS only when side markets are shown (marketLayout === "left").
 * Reads from plugin-owned localStorage so layout plugin controls visibility without trading passing config.
 */
export function getTradingGridPanelIds(): string[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [...TRADING_GRID_PANEL_IDS];
  }
  try {
    const raw = window.localStorage.getItem(HORIZONTAL_MARKETS_LAYOUT_KEY);
    const marketLayout =
      raw === "left" || raw === "top" || raw === "bottom" || raw === "hide"
        ? raw
        : "left";
    if (marketLayout !== "left") {
      return TRADING_GRID_PANEL_IDS.filter(
        (id) => id !== TRADING_PANEL_IDS.MARKETS,
      );
    }
  } catch {
    // ignore
  }
  return [...TRADING_GRID_PANEL_IDS];
}

/**
 * Creates a default trading grid layout using the first built-in preset rule.
 * Panel set (5 vs 6) is derived from plugin state (marketLayout in localStorage); MARKETS only when "left".
 *
 * @returns GridLayoutModel
 */
export function createTradingGridLayout(): GridLayoutModel {
  const panelIds = getTradingGridPanelIds();
  const firstPreset = DEFAULT_GRID_PRESETS[0];
  const rule = firstPreset?.rule;
  return createDefaultGridLayout(panelIds, rule);
}
