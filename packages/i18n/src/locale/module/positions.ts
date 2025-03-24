export const positions = {
  "positions.title": "Positions",
  "positions.position": "Position",
  "positions.positionHistory": "Position history",
  "positions.liquidation": "Liquidation",

  "positions.column.liqPrice": "Liq. price",
  "positions.column.liqPrice.tooltip":
    "Estimated price at which your position will be liquidated. Prices are estimated and depend on multiple factors across all positions.",
  "positions.column.unrealPnl.tooltip":
    "Current unrealized profit or loss on your open positions across all widgets calculated using Mark Price.",
  "positions.column.unrealPnl.priceBasis": "Unrealized PnL Price Basis",
  "positions.column.margin": "Margin",
  "positions.column.margin.tooltip":
    "The minimum equity to keep your position.",
  "positions.column.margin.formula":
    "Margin = Position size * Mark price * MMR",
  "positions.column.close": "Close",

  "positions.limitClose": "Limit close",
  "positions.limitClose.description":
    "You agree closing {{quantity}} {{base}} position at limit price.",
  "positions.marketClose": "Market close",
  "positions.marketClose.description":
    "You agree closing {{quantity}} {{base}} position at market price.",

  "positions.updateOrder.price.required": "Price is required",

  "positions.history.status.closed": "Closed",
  "positions.history.status.partialClosed": "Partially closed",
  "positions.history.type.adl": "Adl",
  "positions.history.type.liquidated": "Liquidated",
  "positions.history.liquidated.liquidationId": "Liquidation id",
  "positions.history.liquidated.liquidatorFee": "Liquidator fee",
  "positions.history.liquidated.insFundFee": "Ins. Fund fee",

  "positions.history.column.closed": "Closed",
  "positions.history.column.maxClosed": "Max closed",
  "positions.history.column.closed&maxClosed": "Closed / Max closed",
  "positions.history.column.netPnl": "Net PnL",
  "positions.history.column.timeOpened": "Time opened",
  "positions.history.column.timeClosed": "Time closed",
  "positions.history.column.updatedTime": "Updated time",

  "positions.history.netPnl.realizedPnl": "Realized PnL",
  "positions.history.netPnl.fundingFee": "Funding fee",
  "positions.history.netPnl.tradingFee": "Trading fee",

  "positions.Liquidation.column.liquidationId": "Liquidation id",
  "positions.Liquidation.column.insFundTransfer": "Ins. fund transfer",
  "positions.Liquidation.column.liquidationFee": "Liquidation fee",
};

export type Positions = typeof positions;
