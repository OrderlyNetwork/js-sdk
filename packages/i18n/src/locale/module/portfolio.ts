export const portfolio = {
  "portfolio.title": "Portfolio",
  "portfolio.sidebar.overview": "Overview",
  "portfolio.sidebar.positions": "Positions",
  "portfolio.sidebar.orders": "Orders",
  "portfolio.sidebar.feeTier": "Fee Tier",
  "portfolio.sidebar.apiKey": "API Key",
  "portfolio.sidebar.setting": "Setting",

  "portfolio.select.7d": "7D",
  "portfolio.select.30d": "30D",
  "portfolio.select.90d": "90D",

  "portfolio.overview.title": "Overview",
  "portfolio.overview.assets.title": "Assets",
  "portfolio.overview.totalValue": "Total value",
  "portfolio.overview.unrealizedPnl": "Unrealized PnL",
  "portfolio.overview.maxAccountLeverage": "Max account leverage",
  "portfolio.overview.availableToWithdraw": "Available to withdraw",

  "portfolio.overview.performance.title": "Performance",
  "portfolio.overview.performance.roi": "{{period}} ROI",
  "portfolio.overview.performance.pnl": "{{period}} PnL",
  "portfolio.overview.performance.volume": "{{period}} Volume (USDC)",
  "portfolio.overview.performance.dailyPnl": "Daily PnL",
  "portfolio.overview.performance.cumulativePnl": "Cumulative PnL",

  "portfolio.overview.dataList.tabs.assetHistory": "Deposits & Withdrawals",
  "portfolio.overview.dataList.tabs.funding": "Funding",
  "portfolio.overview.dataList.tabs.distribution": "Distribution",

  "portfolio.overview.assetHistory.side.deposit": "Deposit",
  "portfolio.overview.assetHistory.side.withdraw": "Withdraw",
  "portfolio.overview.assetHistory.status.new": "NEW",
  "portfolio.overview.assetHistory.status.confirm": "CONFIRM",
  "portfolio.overview.assetHistory.status.processing": "PROCESSING",
  "portfolio.overview.assetHistory.status.completed": "COMPLETED",
  "portfolio.overview.assetHistory.status.failed": "FAILED",
  "portfolio.overview.assetHistory.status.pendingRebalance":
    "PENDING_REBALANCE",

  "portfolio.overview.column.token": "Token",
  "portfolio.overview.column.time": "Time",
  "portfolio.overview.column.txId": "TxID",
  "portfolio.overview.column.status": "Status",
  "portfolio.overview.column.status.processing": "Processing",
  "portfolio.overview.column.status.completed": "Completed",
  "portfolio.overview.column.type": "Type",
  "portfolio.overview.column.amount": "Amount",
  "portfolio.overview.column.symbol": "Symbol",
  "portfolio.overview.column.funding&AnnualRate": "Funding rate / Annual rate",
  "portfolio.overview.column.paymentType": "Payment type",
  "portfolio.overview.column.paymentType.paid": "Paid",
  "portfolio.overview.column.paymentType.received": "Received",
  "portfolio.overview.column.fundingFee": "Funding fee (USDC)",

  "portfolio.overview.distribution.type.referralCommission":
    "Referral commission",
  "portfolio.overview.distribution.type.refereeRebate": "Referee rebate",
  "portfolio.overview.distribution.type.brokerFee": "Broker fee",

  "portfolio.feeTier.title": "Fee Tier",
  "portfolio.feeTier.updatedDailyBy": "<0>Updated daily by</0> <1>2:00 UTC</1>",
  "portfolio.feeTier.header.yourTier": "Your tier",
  "portfolio.feeTier.header.30dVolume": "30D trading volume (USDC)",
  "portfolio.feeTier.header.takerFeeRate": "Taker fee rate",
  "portfolio.feeTier.header.makerFeeRate": "Maker fee rate",
  "portfolio.feeTier.column.tier": "Tier",
  "portfolio.feeTier.column.30dVolume": "30 day volume (USDC)",
  "portfolio.feeTier.column.30dVolume.above": "Above {{volume}}",
  "portfolio.feeTier.column.maker": "Maker",
  "portfolio.feeTier.column.taker": "Taker",

  "portfolio.apiKey.page.title": "API keys",
  "portfolio.apiKey.accountId": "Account ID",
  "portfolio.apiKey.accountId.copy": "Account id copied",
  "portfolio.apiKey.uid": "UID",
  "portfolio.apiKey.secretKey": "Secret key",
  "portfolio.apiKey.secretKey.copy": "Secret key copied",

  "portfolio.apiKey.ip": "IP",
  "portfolio.apiKey.permissions": "Permissions",
  "portfolio.apiKey.permissions.read": "Read",
  "portfolio.apiKey.permissions.trading": "Trading",

  "portfolio.apiKey.description":
    "Create API keys to suit your trading needs. For your security, don't share your API keys with anyone.",
  "portfolio.apiKey.readApiGuide": "Read API guide",

  "portfolio.apiKey.column.apiKey": "API key",
  "portfolio.apiKey.column.apiKey.copy": "API key copied",
  "portfolio.apiKey.column.permissionType": "Permission type",
  "portfolio.apiKey.column.restrictedIP": "Restricted IP",
  "portfolio.apiKey.column.restrictedIP.copy": "Restricted IP copied",
  "portfolio.apiKey.column.expirationDate": "Expiration date",
  "portfolio.apiKey.column.edit": "Edit",
  "portfolio.apiKey.column.delete": "Delete",

  "portfolio.apiKey.create.title": "Create API key",
  "portfolio.apiKey.create.connectWallet.tooltip":
    "Please connect wallet before create API key",
  "portfolio.apiKey.create.signIn.tooltip":
    "Please sign in before create API key",
  "portfolio.apiKey.create.enableTrading.tooltip":
    "Please enable trading before create API key",
  "portfolio.apiKey.create.wrongNetwork.tooltip":
    "Please switch to a supported network to create API key",

  "portfolio.apiKey.create.ipRestriction": "IP restriction (optional)",
  "portfolio.apiKey.create.ipRestriction.placeholder":
    "Add IP addresses, separated by commas.",

  "portfolio.apiKey.created.warning":
    "Please copy the API secret. Once you close this pop-up, the API secret will be encrypted.",
  "portfolio.apiKey.created.button.copyApiInfo": "Copy API info",
  "portfolio.apiKey.apiInfo.copy": "API info copied",

  "portfolio.apiKey.created": "API key created",
  "portfolio.apiKey.deleted": "API key deleted",
  "portfolio.apiKey.updated": "API key updated",

  "portfolio.apiKey.edit.title": "Edit API key",
  "portfolio.apiKey.delete.title": "Delete API key",
  "portfolio.apiKey.delete.description":
    "Delete your API key <0 className='oui-px-1'>{{apiKey}}</0>?",

  "portfolio.setting.page.title": "System upgrade",
  "portfolio.setting.cancelOpenOrders.title":
    "Cancel open orders during system upgrade",
  "portfolio.setting.cancelOpenOrders.description":
    "During the upgrade period, all open orders will be cancelled to manage your risk in case of high market volatility.",
};

export type Portfolio = typeof portfolio;
