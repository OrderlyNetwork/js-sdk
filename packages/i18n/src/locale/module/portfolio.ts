export const portfolio = {
  "portfolio.feeTier": "Fee tier",
  "portfolio.apiKeys": "API Keys",
  "portfolio.setting": "Setting",

  "portfolio.overview.availableWithdraw": "Available to withdraw",

  "portfolio.overview.performance": "Performance",
  "portfolio.overview.performance.roi": "{{period}} ROI",
  "portfolio.overview.performance.pnl": "{{period}} PnL",
  "portfolio.overview.performance.volume": "{{period}} Volume (USDC)",
  "portfolio.overview.performance.dailyPnl": "Daily PnL",
  "portfolio.overview.performance.cumulativePnl": "Cumulative PnL",

  "portfolio.overview.deposits&Withdrawals": "Deposits & Withdrawals",
  "portfolio.overview.distribution": "Distribution",

  "portfolio.assetHistory.status.pending": "Pending",
  "portfolio.assetHistory.status.confirm": "Confirm",
  "portfolio.assetHistory.status.processing": "Processing",
  "portfolio.assetHistory.status.completed": "Completed",
  "portfolio.assetHistory.status.failed": "Failed",
  "portfolio.assetHistory.status.pendingRebalance": "Pending rebalance",

  "portfolio.overview.column.txId": "TxID",
  "portfolio.overview.column.funding&AnnualRate": "Funding rate / Annual rate",
  "portfolio.overview.column.paymentType": "Payment type",
  "portfolio.overview.column.paymentType.paid": "Paid",
  "portfolio.overview.column.paymentType.received": "Received",
  "portfolio.overview.column.fundingFee": "Funding fee",

  "portfolio.overview.distribution.type.referralCommission":
    "Referral commission",
  "portfolio.overview.distribution.type.refereeRebate": "Referee rebate",
  "portfolio.overview.distribution.type.brokerFee": "Broker fee",

  "portfolio.feeTier.updatedDailyBy": "Updated daily by",
  "portfolio.feeTier.header.yourTier": "Your tier",
  "portfolio.feeTier.header.30dVolume": "30D trading volume",
  "portfolio.feeTier.header.takerFeeRate": "Taker fee rate",
  "portfolio.feeTier.header.makerFeeRate": "Maker fee rate",
  "portfolio.feeTier.column.tier": "Tier",
  "portfolio.feeTier.column.30dVolume": "30 day volume",
  "portfolio.feeTier.column.30dVolume.above": "Above {{volume}}",
  "portfolio.feeTier.column.maker": "Maker",
  "portfolio.feeTier.column.taker": "Taker",

  "portfolio.apiKey.accountId": "Account ID",
  "portfolio.apiKey.accountId.copied": "Account id copied",
  "portfolio.apiKey.uid": "UID",
  "portfolio.apiKey.secretKey": "Secret key",
  "portfolio.apiKey.secretKey.copied": "Secret key copied",

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

  "portfolio.apiKey.create.dialog.title": "Create API key",

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
  "portfolio.apiKey.apiInfo.copied": "API info copied",

  "portfolio.apiKey.created": "API key created",
  "portfolio.apiKey.deleted": "API key deleted",
  "portfolio.apiKey.updated": "API key updated",

  "portfolio.apiKey.edit.dialog.title": "Edit API key",
  "portfolio.apiKey.delete.dialog.title": "Delete API key",
  "portfolio.apiKey.delete.dialog.description":
    "Delete your API key <0>{{apiKey}}</0>?",

  "portfolio.setting.systemUpgrade": "System upgrade",
  "portfolio.setting.cancelOpenOrders":
    "Cancel open orders during system upgrade",
  "portfolio.setting.cancelOpenOrders.description":
    "During the upgrade period, all open orders will be cancelled to manage your risk in case of high market volatility.",
};

export type Portfolio = typeof portfolio;
