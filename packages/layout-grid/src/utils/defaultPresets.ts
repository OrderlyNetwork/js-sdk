import { TRADING_PANEL_IDS } from "@orderly.network/layout-core";
import type { GridLayoutPreset, GridLayoutRule } from "../types";

const S = TRADING_PANEL_IDS;

const exchangeStyleRule: GridLayoutRule = {
  lg: [
    {
      panelId: S.SYMBOL_INFO_BAR,
      x: 0,
      y: 0,
      w: 19,
      h: 4,
      minW: 8,
      minH: 2,
      static: true,
      isResizable: false,
      className: "oui-px-3",
    },
    {
      panelId: S.MARKETS,
      x: 0,
      y: 4,
      w: 5,
      h: 30,
    },
    {
      panelId: S.TRADING_VIEW,
      x: 5,
      y: 3,
      w: 10,
      h: 30,
      minW: 4,
      minH: 8,
      resizeHandles: ["se"],
    },
    {
      panelId: S.ORDERBOOK,
      x: 15,
      y: 3,
      w: 4,
      h: 30,
      minW: 3,
      minH: 4,
      resizeHandles: ["se"],
    },
    {
      panelId: S.MARGIN,
      x: 19,
      y: 0,
      w: 5,
      h: 4,
      minW: 3,
      minH: 2,
      isResizable: false,
      className: "oui-p-3",
    },
    {
      panelId: S.ASSETS,
      x: 19,
      y: 4,
      w: 5,
      h: 10,
      minW: 3,
      minH: 2,
      isResizable: false,
      className: "oui-p-3",
    },
    {
      panelId: S.ORDER_ENTRY,
      x: 19,
      y: 15,
      w: 5,
      h: 30,
      minW: 3,
      minH: 4,
      className: "oui-p-3",
      isResizable: false,
    },
    {
      panelId: S.DATA_LIST,
      x: 0,
      y: 24,
      w: 19,
      h: 20,
      className: "oui-p-2",
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

export const DEFAULT_GRID_PRESETS: GridLayoutPreset[] = [
  {
    id: "exchange-style",
    name: "Exchange Style",
    rule: exchangeStyleRule,
    rowHeight: 10,
  } as GridLayoutPreset,
];

export function getDefaultGridPresets(): GridLayoutPreset[] {
  return [...DEFAULT_GRID_PRESETS];
}
