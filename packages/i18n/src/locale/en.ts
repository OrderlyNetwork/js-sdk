import { markets } from "./module/markets";
import { portfolio } from "./module/portfolio";
import { trading } from "./module/trading";
import { chart } from "./module/chart";
import { positions } from "./module/positions";
import { orders } from "./module/orders";
import { tpsl } from "./module/tpsl";
import { share } from "./module/share";
import { orderEntry } from "./module/orderEntry";
import { leverage } from "./module/leverage";
import { scaffold } from "./module/scaffold";
import { tradingRewards } from "./module/tradingRewards";
import { tradingView } from "./module/tradingView";
import { connector } from "./module/connector";
import { transfer } from "./module/transfer";
import { affiliate } from "./module/affiliate";
import { ui } from "./module/ui";

export const en = {
  "common.cancel": "Cancel",
  "common.confirm": "Confirm",
  "common.ok": "OK",
  "common.no": "No",
  "common.all": "All",
  "common.buy": "Buy",
  "common.sell": "Sell",
  "common.edit": "Edit",
  "common.save": "Save",
  "common.tips": "Tips",
  "common.copy.success": "Copy success",

  "common.select.all": "All",
  "common.select.1d": "1D",
  "common.select.7d": "7D",
  "common.select.30d": "30D",
  "common.select.90d": "90D",

  "common.column.date": "Date",

  "common.column.price": "Price",
  "common.column.quantity": "Quantity",
  "common.column.status": "Status",

  /** linkDevice */
  "linkDevice.createQRCode.dialog.title": "Confirm",
  "linkDevice.createQRCode.loading.description":
    "Approve QR code with wallet...",
  "linkDevice.createQRCode.confirm.title": "Link Mobile Device",
  "linkDevice.createQRCode.confirm.description":
    "Open {{hostname}} on your mobile device and scan the QR code to link this wallet. For security, the QR code will expire in 60 seconds. <br/> The QR code allows mobile trading but does not enable withdrawals. Ensure you are not sharing your screen or any screenshots of the QR code.",

  "linkDevice.createQRCode.success.description":
    "Scan the QR code or paste the URL into another browser/<br/>device to continue.",
  "linkDevice.createQRCode.success.countdown": "Countdown: <0>{{seconds}}s</0>",
  "linkDevice.createQRCode.success.copyUrl": "Copy URL",

  "linkDevice.scanQRCode.dialog.title": "Confirm",
  "linkDevice.scanQRCode": "Scan QR Code",
  "linkDevice.scanQRCode.description":
    "Click the <0/> icon in the top right corner on desktop to generate a QR code to scan.",
  "linkDevice.scanQRCode.tooltip": "Link to Desktop via QR Code",
  "linkDevice.scanQRCode.connected.description":
    "You are connected via another device. This mode is for trading only. To switch networks, deposit or withdraw assets, please disconnect and reconnect your wallet on this device.",

  /** settle */
  "settle.title": "Settle",
  "settle.settlePnl": "Settle PnL",
  "settle.settlePnl.warning": "Please settle your balance",
  "settle.settlePnl.description":
    "Are you sure you want to settle your PnL? <br/> Settlement will take up to 1 minute before you can withdraw your available balance.",

  "settle.unsettled.label": "Unsettled:",
  "settle.unsettled.tooltip":
    "Unsettled balance can not be withdrawn. In order to withdraw, please settle your balance first.",
  "settle.settle": "Settle",

  "settle.settlement.requested": "Settlement requested",
  "settle.settlement.completed": "Settlement completed",
  "settle.settlement.failed": "Settlement failed",
  "settle.settlement.error":
    "Settlement is only allowed once every 10 minutes. Please try again later.",

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
} as const;

export type EN = typeof en;
