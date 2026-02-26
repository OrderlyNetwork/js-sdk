/**
 * Built-in grid layout preset: exchange-style only.
 * Used when plugin does not replace it; developers can merge or replace via layouts(builtIn).
 */
import { TRADING_PANEL_IDS } from "@orderly.network/layout-core";
import type { GridLayoutPreset, GridLayoutRule } from "../types";

const S = TRADING_PANEL_IDS;

/**
 * Exchange-style: symbol bar full width, chart left, orderbook/orderEntry/dataList right, markets bottom.
 */
const exchangeStyleRule: GridLayoutRule = {
  lg: [
    { panelId: S.SYMBOL_INFO_BAR, x: 0, y: 0, w: 12, h: 2, minW: 8, minH: 1 },
    { panelId: S.TRADING_VIEW, x: 0, y: 2, w: 8, h: 12, minW: 4, minH: 6 },
    { panelId: S.ORDERBOOK, x: 8, y: 2, w: 4, h: 4, minW: 3, minH: 2 },
    { panelId: S.ORDER_ENTRY, x: 8, y: 6, w: 4, h: 4, minW: 3, minH: 2 },
    { panelId: S.DATA_LIST, x: 8, y: 10, w: 4, h: 4, minW: 3, minH: 2 },
    { panelId: S.MARKETS, x: 0, y: 14, w: 12, h: 4, minW: 6, minH: 2 },
  ],
  md: [
    { panelId: S.SYMBOL_INFO_BAR, x: 0, y: 0, w: 10, h: 2, minW: 6, minH: 1 },
    { panelId: S.TRADING_VIEW, x: 0, y: 2, w: 6, h: 10, minW: 4, minH: 6 },
    { panelId: S.ORDERBOOK, x: 6, y: 2, w: 4, h: 4, minW: 3, minH: 2 },
    { panelId: S.ORDER_ENTRY, x: 6, y: 6, w: 4, h: 4, minW: 3, minH: 2 },
    { panelId: S.DATA_LIST, x: 6, y: 10, w: 4, h: 2, minW: 3, minH: 2 },
    { panelId: S.MARKETS, x: 0, y: 12, w: 10, h: 4, minW: 4, minH: 2 },
  ],
  sm: [
    { panelId: S.SYMBOL_INFO_BAR, x: 0, y: 0, w: 6, h: 2, minW: 4, minH: 1 },
    { panelId: S.TRADING_VIEW, x: 0, y: 2, w: 6, h: 6, minW: 4, minH: 4 },
    { panelId: S.ORDERBOOK, x: 0, y: 8, w: 6, h: 3, minW: 4, minH: 2 },
    { panelId: S.ORDER_ENTRY, x: 0, y: 11, w: 6, h: 4, minW: 4, minH: 2 },
    { panelId: S.DATA_LIST, x: 0, y: 15, w: 6, h: 3, minW: 4, minH: 2 },
    { panelId: S.MARKETS, x: 0, y: 18, w: 6, h: 4, minW: 4, minH: 2 },
  ],
  xs: [
    { panelId: S.SYMBOL_INFO_BAR, x: 0, y: 0, w: 4, h: 2, minW: 2, minH: 1 },
    { panelId: S.TRADING_VIEW, x: 0, y: 2, w: 4, h: 6, minW: 2, minH: 4 },
    { panelId: S.ORDERBOOK, x: 0, y: 8, w: 4, h: 3, minW: 2, minH: 2 },
    { panelId: S.ORDER_ENTRY, x: 0, y: 11, w: 4, h: 4, minW: 2, minH: 2 },
    { panelId: S.DATA_LIST, x: 0, y: 15, w: 4, h: 3, minW: 2, minH: 2 },
    { panelId: S.MARKETS, x: 0, y: 18, w: 4, h: 4, minW: 2, minH: 2 },
  ],
  xxs: [
    { panelId: S.SYMBOL_INFO_BAR, x: 0, y: 0, w: 2, h: 2, minW: 1, minH: 1 },
    { panelId: S.TRADING_VIEW, x: 0, y: 2, w: 2, h: 6, minW: 1, minH: 4 },
    { panelId: S.ORDERBOOK, x: 0, y: 8, w: 2, h: 3, minW: 1, minH: 2 },
    { panelId: S.ORDER_ENTRY, x: 0, y: 11, w: 2, h: 4, minW: 1, minH: 2 },
    { panelId: S.DATA_LIST, x: 0, y: 15, w: 2, h: 3, minW: 1, minH: 2 },
    { panelId: S.MARKETS, x: 0, y: 18, w: 2, h: 4, minW: 1, minH: 2 },
  ],
};

/** Built-in layout preset: exchange-style only. */
export const DEFAULT_GRID_PRESETS: GridLayoutPreset[] = [
  { id: "exchange-style", name: "Exchange Style", rule: exchangeStyleRule },
];

/**
 * Returns the built-in presets array. Exposed for plugin options layouts(builtIn).
 */
export function getDefaultGridPresets(): GridLayoutPreset[] {
  return [...DEFAULT_GRID_PRESETS];
}
