export const positions = {
  "positions.page.title": "Positions",
  "positions.page.tabs.positions": "Positions",
  "positions.page.tabs.positionHistory": "Position history",
  "positions.page.tabs.liquidation": "Liquidation",

  "positions.market": "Market",
  "positions.limit": "Limit",

  "positions.column.symbol": "Symbol",
  "positions.column.quantity": "Quantity",
  "positions.column.avgOpen": "Avg. open",
  "positions.column.markPrice": "Mark price",
  "positions.column.liqPrice": "Liq. price",
  "positions.column.liqPrice.tooltip":
    "Estimated price at which your position will be liquidated. Prices are estimated and depend on multiple factors across all positions.",
  "positions.column.unrealPnl": "Unreal. PnL",
  "positions.column.unrealPnl.quote": "Unreal. PnL<0>(USDC)</0>",
  "positions.column.unrealPnl.tooltip":
    "Current unrealized profit or loss on your open positions across all widgets calculated using Mark Price.",
  "positions.column.unrealPnl.priceBasis": "Unrealized PnL Price Basis",
  "positions.column.lastPrice": "Last price",
  "positions.column.tpSl": "TP/SL",
  "positions.column.notional": "Notional",
  "positions.column.notional.quote": "Notional<0>(USDC)</0>",
  "positions.column.margin": "Margin",
  "positions.column.margin.quote": "Margin<0>(USDC)</0>",
  "positions.column.margin.tooltip":
    "The minimum equity to keep your position.",
  "positions.column.margin.formula":
    "Margin = Position size * Mark price * MMR",
  "positions.column.qty": "Qty.",
  "positions.column.price": "Price",
  "positions.column.close": "Close",

  "positions.limitClose": "Limit close",
  "positions.limitClose.description":
    "You agree closing {{quantity}} {{base}} position at limit price.",
  "positions.limitClose.max": "<0>Max</0> <1>{{quantity}}</1>",

  "positions.marketClose": "Market close",
  "positions.marketClose.description":
    "You agree closing {{quantity}} {{base}} position at market price.",

  "positions.updateOrder.price.required": "Price is required",

  "positions.tp.prefix": "TP - ",
  "positions.sl.prefix": "SL - ",
  "positions.tpsl.prefix": "TP/SL: ",

  "positions.filter.1d": "1D",
  "positions.filter.7d": "7D",
  "positions.filter.30d": "30D",
  "positions.filter.90d": "90D",

  "positions.history.side.all": "All sides",
  "positions.history.status.all": "All status",
  "positions.history.status.closed": "Closed",
  "positions.history.status.partialClosed": "Partially closed",
  "positions.history.type.adl": "Adl",
  "positions.history.Liquidation": "Liquidation",
  "positions.history.type.liquidated": "Liquidated",
  "positions.history.liquidated.liquidationId": "Liquidation id",
  "positions.history.liquidated.liquidatorFee": "Liquidator fee",
  "positions.history.liquidated.insFundFee": "Ins. Fund fee",

  "positions.history.column.symbol": "Symbol",
  "positions.history.column.closed": "Closed",
  "positions.history.column.maxClosed": "Max closed",
  "positions.history.column.closed&maxClosed": "Closed / Max closed",
  "positions.history.column.netPnl": "Net PnL",
  "positions.history.column.avgOpen": "Avg. open",
  "positions.history.column.avgOpen.quote": "Avg. open <0>(USDC)</0>",
  "positions.history.column.avgClose": "Avg. close",
  "positions.history.column.avgClose.quote": "Avg. close <0>(USDC)</0>",
  "positions.history.column.timeOpened": "Time opened",
  "positions.history.column.timeClosed": "Time closed",
  "positions.history.column.updatedTime": "Updated time",

  "positions.history.netPnl.realizedPnl": "Realized PnL",
  "positions.history.netPnl.fundingFee": "Funding fee",
  "positions.history.netPnl.tradingFee": "Trading fee",

  "positions.Liquidation": "Liquidation",
  "positions.Liquidation.column.time": "Time",
  "positions.Liquidation.column.liquidationId": "Liquidation id",
  "positions.Liquidation.column.liquidationId.label": "Liquidation id:",
  "positions.Liquidation.column.insFundTransfer": "Ins. fund transfer",
  "positions.Liquidation.column.insFundTransfer.label": "Ins. Fund Transfer:",
  "positions.Liquidation.column.symbol": "Symbol",
  "positions.Liquidation.column.price": "Price (USDC)",
  "positions.Liquidation.column.price.quote": "Price <0>(USDC)</0>",
  "positions.Liquidation.column.quantity": "Quantity",
  "positions.Liquidation.column.liquidationFee": "Liquidation fee",
};

export type Positions = typeof positions;
