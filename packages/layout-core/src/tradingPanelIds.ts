/**
 * Trading page panel ID constants.
 * Used across layout strategies (split, grid) to identify trading panels.
 * Component mapping happens in the trading package.
 */
export const TRADING_PANEL_IDS = {
  SYMBOL_INFO_BAR: "symbolInfoBar",
  TRADING_VIEW: "tradingView",
  ORDERBOOK: "orderbook",
  DATA_LIST: "dataList",
  ORDER_ENTRY: "orderEntry",
  MARKETS: "markets",
} as const;

export type TradingPanelId =
  (typeof TRADING_PANEL_IDS)[keyof typeof TRADING_PANEL_IDS];
