export const trading = {
  "trading.layout": "Layout",
  "trading.layout.right": "Advanced (right)",
  "trading.layout.left": "Advanced (left)",
  "trading.orders.closeAll": "Close All",
  "trading.hideOtherSymbols": "Hide other symbols",
  "trading.history": "History",

  "trading.portfolioSettings": "Portfolio Settings",
  "trading.portfolioSettings.decimalPrecision":
    "Decimal Precision for PnL & Notional",
  "trading.portfolioSettings.unrealPnlPriceBasis": "Unrealized PnL Price Basis",

  "trading.orderBook": "Order book",
  "trading.lastTrades": "Last trades",
  "trading.orderBook.column.value": "Value",

  "trading.tabs.chart": "Chart",
  "trading.tabs.trades": "Trades",
  "trading.tabs.data": "Data",

  "trading.column.24High": "24h high",
  "trading.column.24Low": "24h low",

  "trading.orderBook.sum": "Sum",
  "trading.orderBook.markPrice.tooltip":
    "Obtained from a third-party oracle, the mark price is calculated as the median of three prices: the last price, the fair price based on the funding rate basis, and the fair price based on the order books.",
  "trading.orderBook.spreadRatio.tooltip": "Spread Ratio of the ask1 and bid1.",

  "trading.faucet.getTestUSDC": "Get test USDC",
  "trading.faucet.getTestUSDC.success":
    "{{quantity}} USDC will be added to your balance. Please note this may take up to 3 minutes. Please check back later.",

  "trading.asset.startTrading": "Start trading",
  "trading.asset.startTrading.description":
    "You can deposit assets from various networks",

  "trading.asset.myAssets": "My Assets",

  "trading.asset.freeCollateral": "Free collateral",
  "trading.asset.freeCollateral.tooltip":
    "Free collateral for placing new orders.",
  "trading.asset.freeCollateral.formula":
    "Free collateral = Total balance + Total unsettlement PnL - Total position initial margin",

  "trading.asset.marginRatio": "Margin ratio",
  "trading.asset.marginRatio.tooltip":
    "The margin ratio represents the proportion of collateral relative to the total position value.",
  "trading.asset.marginRatio.formula":
    "Account margin ratio = (Total collateral value / Total position notional) * 100%",

  "trading.asset.unsettledPnl": "Unsettled PnL",
  "trading.asset.free&TotalCollateral": "Free / Total Collateral",
  "trading.asset.availableBalance": "Available Balance",

  "trading.asset.maintenanceMarginRatio": "Maintenance margin ratio",
  "trading.asset.maintenanceMarginRatio.tooltip":
    "The minimum margin ratio required to protect your positions from being liquidated. If the Margin ratio falls below the Maintenance margin ratio, the account will be liquidated.",
  "trading.asset.maintenanceMarginRatio.formula":
    "Account maintenance margin ratio = Sum(Position notional * Symbol maintenance Margin Ratio)  / Total position notional * 100%",

  "trading.riskRate": "Risk rate",
  "trading.riskRate.tooltip":
    "The Risk rate is used to assess the risk level of an account. When the Risk rate reaches 100%, the account will be liquidated",
  "trading.riskRate.formula":
    "Risk rate = Maintenance margin ratio / Margin ratio * 100%",

  "trading.asset&Margin": "Asset & Margin",

  "trading.fundingRate.predFundingRate": "Pred. funding rate",
};

export type Trading = typeof trading;
