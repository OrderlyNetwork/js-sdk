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

  "block.accountStatus.asset&margin": "Assets & Margin",
  "block.accountStatus.instrument": "Instrument",
  "block.accountStatus.myAccount": "My account",
  "toast.copiedToClipboard": "Copied to clipboard",
  "toast.requestSettlement": "Request settlement",
  "toast.leverageUpdated": "Leverage updated",
  "toast.networkSwitched": "Network switched",
  "dialog.switchNetwork": "Switch network",

  "modal.title.getTestUSDC": "Get test USDC",
  "modal.content.getTestUSDC":
    "1,000 USDC will be added to your balance. Please note this may take up to 3 minutes. Please check back later.",
  "modal.content.settlePnl":
    "Are you sure you want to settle your PnL? Settlement will take up to 1 minute before you can withdraw your available balance.",

  "ui.calendar.selecet-date": "select date",
} as const;

export type EN = typeof en;
