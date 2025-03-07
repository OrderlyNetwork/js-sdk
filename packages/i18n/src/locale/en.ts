import { markets } from "./module/markets";

export const en = {
  "common.disconnect": "Disconnect",
  "common.testnet": "Testnet",
  "common.mainnet": "Mainnet",
  "common.totalValue": "Total value",
  "common.settlePnl": "Settle PnL",
  "common.unreal.Pnl": "Unreal.PnL",
  "common.unsettledPnL": "Unsettled PnL",
  "common.marginRatio": "Margin ratio",
  "common.maxAccountLeverage": "Max account leverage",
  "common.availableBalance": "Available balance",
  "common.deposit": "Deposit",
  "common.withdraw": "Withdraw",
  "common.cancel": "Cancel",
  "common.ok": "OK",
  "common.connectWallet": "Connect wallet",
  "common.connectWallet1": "Connect wallet",
  ...markets,
} as const;

export type EN = typeof en;
