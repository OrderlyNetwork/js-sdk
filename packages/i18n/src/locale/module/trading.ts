export const trading = {
  "trading.layout": "Layout",
  "trading.layout.right": "Advanced (right)",
  "trading.layout.left": "Advanced (left)",
  "trading.orders.closeAll": "Close All",
  "trading.hideOtherSymbols": "Hide other symbols",

  "trading.dataList.tabs.position": "Position",
  "trading.dataList.tabs.position.count": "Position({{count}})",
  "trading.dataList.tabs.pending": "Pending",
  "trading.dataList.tabs.pending.count": "Pending({{count}})",
  "trading.dataList.tabs.tpsl": "TP/SL",
  "trading.dataList.tabs.tpsl.count": "TP/SL({{count}})",
  "trading.dataList.tabs.filled": "Filled",
  "trading.dataList.tabs.history": "History",
  "trading.dataList.tabs.liquidation": "Liquidation",
  "trading.dataList.tabs.positionHistory": "Position history",
  "trading.dataList.tabs.orderHistory": "Order history",

  "trading.dataList.portfolioSettings": "Portfolio Settings",
  "trading.dataList.portfolioSettings.decimalPrecision":
    "Decimal Precision for PnL & Notional",
  "trading.dataList.portfolioSettings.unrealPnlPriceBasis":
    "Unrealized PnL Price Basis",
  "trading.markPrice": "Mark price",
  "trading.lastPrice": "Last price",

  "trading.orderBook": "Order book",
  "trading.lastTrades": "Last trades",
  "trading.orderBook.column.time": "Time",
  "trading.orderBook.column.price": "Price",
  "trading.orderBook.column.qty": "Qty",
  "trading.orderBook.column.value": "Value",
  "trading.orderBook.column.price.quote": "Price({{quote}})",
  "trading.orderBook.column.qty.base": "Qty({{base}})",
  "trading.orderBook.column.total.unit": "Total({{unit}})",

  "trading.tabs.chart": "Chart",
  "trading.tabs.trades": "Trades",
  "trading.tabs.data": "Data",

  "trading.tradeData.column.markPrice": "Mark price",
  "trading.tradeData.column.indexPrice": "Index price",
  "trading.tradeData.column.24Volume": "24h volume",
  "trading.tradeData.column.24High": "24h high",
  "trading.tradeData.column.24Low": "24h low",
  "trading.tradeData.column.openInterest": "Open interest",

  "trading.orderBook.row.tooltip.avgPrice": "Avg. Price≈",
  "trading.orderBook.row.tooltip.sum": "Sum ({{unit}})",
  "trading.orderBook.markPrice.tooltip":
    "Obtained from a third-party oracle, the mark price is calculated as the median of three prices: the last price, the fair price based on the funding rate basis, and the fair price based on the order books.",
  "trading.orderBook.spreadRatio.tooltip": "Spread Ratio of the ask1 and bid1.",

  "trading.faucet.getTestUSDC": "Get test USDC",
  "trading.faucet.getTestUSDC.success":
    "{{quantity}} USDC will be added to your balance. Please note this may take up to 3 minutes. Please check back later.",

  "trading.asset.startTrading": "Start trading",
  "trading.asset.startTrading.description":
    "You can deposit assets from various networks",

  "trading.asset.wrongNetwork": "Wrong Network",
  "trading.asset.wrongNetwork.description":
    "Please switch to a supported network to continue.",

  "trading.asset.connectWallet": "Connect wallet",
  "trading.asset.connectWallet.description":
    "Please connect your wallet before starting to trade.",

  "trading.asset.signIn": "Sign in",
  "trading.asset.signIn.description":
    "Please sign in before starting to trade.",

  "trading.asset.enableTrading": "Enable trading",
  "trading.asset.enableTrading.description":
    "Enable trading before starting to trade.",

  "trading.asset.myAssets": "My Assets (USDC)",

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

  "trading.asset.totalValue": "Total value",
  "trading.asset.totalValueQuote": "Total value (USDC)",
  "trading.asset.unrealPnlQuote": "Unreal. PnL (USDC)",
  "trading.asset.unsettledPnlQuote": "Unsettled PnL (USDC)",
  "trading.asset.free&TotalCollateralQuote": "Free / Total Collateral (USDC)",
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

  "trading.settlePnl": "Settle PnL",
  "trading.settlePnl.description":
    "Are you sure you want to settle your PnL? Settlement will take up to 1 minute before you can withdraw your available balance.",

  "trading.settlement.requested": "Settlement requested",
  "trading.settlement.completed": "Settlement completed",
  "trading.settlement.failed": "Settlement failed",
  "trading.settlement.error":
    "Settlement is only allowed once every 10 minutes. Please try again later.",

  "trading.account": "Account",
  "trading.asset&Margin": "Asset & Margin",

  "trading.fundingRate.predFundingRate": "Pred. funding rate",
} as const;

export type Trading = typeof trading;
