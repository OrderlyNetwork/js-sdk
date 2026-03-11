/**
 * Built-in grid layout preset: exchange-style only.
 * Used when plugin does not replace it; developers can merge or replace via layouts(builtIn).
 */
import { TRADING_PANEL_IDS } from "@orderly.network/layout-core";
import type { GridLayoutPreset, GridLayoutRule } from "../types";

const S = TRADING_PANEL_IDS;

/**
 * Exchange-style: symbol bar full width, chart left, orderbook/orderEntry/dataList right, markets bottom.
 * Uses rowHeight: 20 for finer grid adjustment (vs default 30).
 */
const exchangeStyleRule: GridLayoutRule = {
  lg: [
    {
      panelId: S.SYMBOL_INFO_BAR,
      x: 0,
      y: 0,
      w: 9,
      h: 3,
      minW: 8,
      minH: 2,
      static: true,
      isResizable: false,
    },
    {
      panelId: S.TRADING_VIEW,
      x: 0,
      y: 3,
      w: 6,
      h: 21,
      minW: 4,
      minH: 8,
      resizeHandles: ["se"],
    },
    {
      panelId: S.ORDERBOOK,
      x: 6,
      y: 3,
      w: 3,
      h: 21,
      minW: 3,
      minH: 4,
      resizeHandles: ["se"],
    },
    {
      panelId: S.MARGIN,
      x: 9,
      y: 0,
      w: 3,
      h: 2,
      minW: 3,
      minH: 2,
      isResizable: false,
    },
    {
      panelId: S.ASSETS,
      x: 9,
      y: 2,
      w: 3,
      h: 6,
      minW: 3,
      minH: 2,
      isResizable: false,
    },
    {
      panelId: S.ORDER_ENTRY,
      x: 9,
      y: 8,
      w: 3,
      h: 28,
      minW: 3,
      minH: 4,
    },
    {
      panelId: S.DATA_LIST,
      x: 0,
      y: 24,
      w: 9,
      h: 13,
      minW: 3,
      minH: 3,
    },
    {
      panelId: S.MARKETS,
      x: 0,
      y: 37,
      w: 6,
      h: 11,
      minW: 6,
      minH: 4,
    },
  ],
  md: [
    { panelId: S.SYMBOL_INFO_BAR, x: 0, y: 0, w: 10, h: 3, minW: 6, minH: 2 },
    { panelId: S.TRADING_VIEW, x: 0, y: 3, w: 6, h: 14, minW: 4, minH: 8 },
    { panelId: S.ORDERBOOK, x: 6, y: 3, w: 4, h: 5, minW: 3, minH: 3 },
    { panelId: S.ORDER_ENTRY, x: 6, y: 8, w: 4, h: 5, minW: 3, minH: 4 },
    { panelId: S.DATA_LIST, x: 6, y: 13, w: 4, h: 4, minW: 3, minH: 3 },
    { panelId: S.MARKETS, x: 0, y: 17, w: 10, h: 6, minW: 4, minH: 4 },
  ],
};

/** Exchange-style preset with rowHeight: 20 for finer grid adjustment */
export const DEFAULT_GRID_PRESETS: GridLayoutPreset[] = [
  {
    id: "exchange-style",
    name: "Exchange Style",
    rule: exchangeStyleRule,
    rowHeight: 20,
  } as GridLayoutPreset,
];

/**
 * Returns the built-in presets array. Exposed for plugin options layouts(builtIn).
 */
export function getDefaultGridPresets(): GridLayoutPreset[] {
  return [...DEFAULT_GRID_PRESETS];
}
