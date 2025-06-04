import { affiliate } from "./module/affiliate";
import { chart } from "./module/chart";
import { connector } from "./module/connector";
import { leverage } from "./module/leverage";
import { markets } from "./module/markets";
import { orderEntry } from "./module/orderEntry";
import { orders } from "./module/orders";
import { portfolio } from "./module/portfolio";
import { positions } from "./module/positions";
import { scaffold } from "./module/scaffold";
import { share } from "./module/share";
import { tpsl } from "./module/tpsl";
import { trading } from "./module/trading";
import { tradingLeaderboard } from "./module/tradingLeaderboard";
import { tradingRewards } from "./module/tradingRewards";
import { tradingView } from "./module/tradingView";
import { transfer } from "./module/transfer";
import { ui } from "./module/ui";

export const en = {
  "common.cancel": "Cancel",
  "common.confirm": "Confirm",
  "common.ok": "OK",
  "common.yes": "Yes",
  "common.no": "No",
  "common.all": "All",
  "common.buy": "Buy",
  "common.sell": "Sell",
  "common.long": "Long",
  "common.short": "Short",
  "common.edit": "Edit",
  "common.save": "Save",
  "common.add": "Add",
  "common.delete": "Delete",
  "common.tips": "Tips",
  "common.max": "Max",
  "common.download": "Download",
  "common.copy": "Copy",
  "common.copy.failed": "Copy failed",
  "common.copy.copied": "Copied",
  "common.share": "Share",
  "common.export": "Export",

  "common.select.1d": "1D",
  "common.select.3d": "3D",
  "common.select.7d": "7D",
  "common.select.14d": "14D",
  "common.select.30d": "30D",
  "common.select.90d": "90D",

  "common.price": "Price",
  "common.quantity": "Quantity",
  "common.qty": "Qty",
  "common.status": "Status",
  "common.status.all": "All status",

  "common.date": "Date",
  "common.time": "Time",
  "common.volume": "Volume",
  "common.total": "Total",
  "common.symbol": "Symbol",
  "common.token": "Token",
  "common.amount": "Amount",

  "common.side": "Side",
  "common.side.all": "All sides",
  "common.type": "Type",
  "common.notional": "Notional",
  "common.fee": "Fee",
  "common.fees": "Fees",

  "common.avgPrice": "Avg. price",
  "common.avgOpen": "Avg. open",
  "common.avgClose": "Avg. close",
  "common.trigger": "Trigger",
  "common.lastPrice": "Last price",
  "common.indexPrice": "Index price",
  "common.markPrice": "Mark price",
  "common.limitPrice": "Limit price",
  "common.marketPrice": "Market",

  "common.unrealizedPnl": "Unrealized PnL",
  "common.realizedPnl": "Realized PnL",
  "common.totalValue": "Total value",
  "common.address": "Address",
  "common.address.search.placeholder": "Search address",
  "common.available": "Available",

  "common.overview": "Overview",
  "common.funding": "Funding",
  "common.assets": "Assets",
  "common.countdown": "Countdown",
  "common.current": "Current",
  "common.account": "Account",

  "common.deposit": "Deposit",
  "common.withdraw": "Withdraw",
  "common.settle": "Settle",
  "common.markets": "Markets",
  "common.portfolio": "Portfolio",
  "common.positions": "Positions",
  "common.position": "Position",
  "common.orders": "Orders",
  "common.tpsl": "TP/SL",
  "common.leverage": "Leverage",
  "common.affiliate": "Affiliate",
  "common.tradingRewards": "Trading rewards",
  "common.trading": "Trading",
  "assetHistory.status.pending": "Pending",
  "assetHistory.status.confirm": "Confirm",
  "assetHistory.status.processing": "Processing",
  "assetHistory.status.completed": "Completed",
  "assetHistory.status.failed": "Failed",
  "assetHistory.status.pendingRebalance": "Pending rebalance",

  /** linkDevice */
  "linkDevice.createQRCode.loading.description":
    "Approve QR code with wallet...",
  "linkDevice.createQRCode.linkMobileDevice": "Link Mobile Device",
  "linkDevice.createQRCode.linkMobileDevice.description":
    "Open {{hostname}} on your mobile device and scan the QR code to link this wallet. For security, the QR code will expire in 60 seconds. <br/> The QR code allows mobile trading but does not enable withdrawals. Ensure you are not sharing your screen or any screenshots of the QR code.",

  "linkDevice.createQRCode.success.description":
    "Scan the QR code or paste the URL into another browser/<br/>device to continue.",
  "linkDevice.createQRCode.success.copyUrl": "Copy URL",

  "linkDevice.scanQRCode": "Scan QR Code",
  "linkDevice.scanQRCode.description":
    "Click the <0/> icon in the top right corner on desktop to generate a QR code to scan.",
  "linkDevice.scanQRCode.tooltip": "Link to Desktop via QR Code",
  "linkDevice.scanQRCode.connected.description":
    "You are connected via another device. This mode is for trading only. To switch networks, deposit or withdraw assets, please disconnect and reconnect your wallet on this device.",

  /** settle */
  "settle.settlePnl": "Settle PnL",
  "settle.settlePnl.warning": "Please settle your balance",
  "settle.settlePnl.description":
    "Are you sure you want to settle your PnL? <br/> Settlement will take up to 1 minute before you can withdraw your available balance.",

  "settle.unsettled": "Unsettled",
  "settle.unsettled.tooltip":
    "Unsettled balance can not be withdrawn. In order to withdraw, please settle your balance first.",

  "settle.settlement.requested": "Settlement requested",
  "settle.settlement.completed": "Settlement completed",
  "settle.settlement.failed": "Settlement failed",
  "settle.settlement.error":
    "Settlement is only allowed once every 10 minutes. Please try again later.",

  "languageSwitcher.language": "Language",
  "languageSwitcher.tips":
    "AI-generated translations may not be fully accurate.",

  "announcement.type.listing": "Listing",
  "announcement.type.maintenance": "Maintenance",
  "announcement.type.delisting": "Delisting",

  "maintenance.dialog.title": "System upgrade in progress",
  "maintenance.dialog.description":
    "Sorry, {{brokerName}} is temporarily unavailable due to a scheduled upgrade. The service is expected to be back by {{endDate}}.",
  "maintenance.tips.description":
    "{{brokerName}} will be temporarily unavailable for a scheduled upgrade from {{startDate}} to {{endDate}}.",

  "restrictedInfo.description.default":
    " You are accessing {{brokerName}} from an IP address ({{ip}}) associated with a restricted country.",

  ...markets,
  ...portfolio,
  ...trading,
  ...chart,
  ...positions,
  ...orders,
  ...tpsl,
  ...share,
  ...orderEntry,
  ...leverage,
  ...scaffold,
  ...tradingRewards,
  ...tradingView,
  ...connector,
  ...transfer,
  ...affiliate,
  ...ui,
  ...tradingLeaderboard,
};
