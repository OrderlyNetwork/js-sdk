/**
 * Default trading grid layout for LayoutHost with gridStrategy.
 * Uses TRADING_PANEL_IDS from layout-core; component mapping is in the trading package.
 */
import { TRADING_PANEL_IDS } from "@orderly.network/layout-core";
import type { GridLayoutModel } from "../types";
import { createDefaultGridLayout } from "./gridLayoutUtils";

/** Panel IDs for trading grid in display order (symbolInfoBar, tradingView, orderbook, dataList, orderEntry, markets) */
const TRADING_GRID_PANEL_IDS = [
  TRADING_PANEL_IDS.SYMBOL_INFO_BAR,
  TRADING_PANEL_IDS.TRADING_VIEW,
  TRADING_PANEL_IDS.ORDERBOOK,
  TRADING_PANEL_IDS.DATA_LIST,
  TRADING_PANEL_IDS.ORDER_ENTRY,
  TRADING_PANEL_IDS.MARKETS,
] as const;

/**
 * Creates a default trading grid layout.
 * Use as initialLayout for LayoutHost with gridStrategy.
 *
 * @returns GridLayoutModel
 */
export function createTradingGridLayout(): GridLayoutModel {
  return createDefaultGridLayout([...TRADING_GRID_PANEL_IDS]);
}
