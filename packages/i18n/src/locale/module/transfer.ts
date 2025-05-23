export const transfer = {
  "transfer.network": "Network",
  "transfer.lowestFee": "lowest fee",
  "transfer.web3Wallet": "Your Web3 Wallet",
  "transfer.brokerAccount": "Your {{brokerName}} account",
  "transfer.quantity.invalid": "Please input a valid number",

  "transfer.insufficientBalance": "Insufficient balance",
  "transfer.insufficientAllowance": "Insufficient allowance",
  "transfer.rejectTransaction": "Rejected transaction",

  "transfer.deposit.approve.symbol": "Approve {{symbol}}",
  "transfer.deposit.approve.success": "Approve success",
  "transfer.deposit.approve.failed": "Approve failed",
  "transfer.deposit.increase.symbol": "Increase {{symbol}} authorized amount",
  "transfer.deposit.requested": "Deposit requested",
  "transfer.deposit.completed": "Deposit completed",
  "transfer.deposit.failed": "Deposit failed",

  "transfer.deposit.destinationGasFee": "Destination gas fee",
  "transfer.deposit.destinationGasFee.description":
    "Additional gas tokens are required to cover operations on the destination chain.",

  "transfer.withdraw.unsupported.chain":
    "Withdrawals are not supported on this chain. Please switch to any of the bridgeless networks.",
  "transfer.withdraw.unsupported.networkName":
    "Withdrawals are not supported on {{networkName}}. Please switch to any of the bridgeless networks.",

  "transfer.withdraw.crossChain.confirmWithdraw": "Confirm to withdraw",
  "transfer.withdraw.crossChain.recipientAddress": "Recipient address",
  "transfer.withdraw.crossChain.recipientNetwork": "Recipient network",
  "transfer.withdraw.crossChain.withdrawAmount": "Withdraw amount",

  "transfer.withdraw.crossChain.process":
    "Your cross-chain withdrawal is being processed...",
  "transfer.withdraw.crossChain.warning":
    "Withdrawals that require cross-chain rebalancing can't be cancelled or followed up with more withdrawals until they've been processed.",
  "transfer.withdraw.crossChain.vaultWarning":
    "Withdrawal exceeds the balance of the {{networkName}} vault ( {{chainVaultBalance}} USDC ). Cross-chain rebalancing fee will be charged for withdrawal to {{networkName}}.",

  "transfer.withdraw.minAmount.error": "quantity must large than {{minAmount}}",

  "transfer.withdraw.requested": "Withdraw requested",
  "transfer.withdraw.completed": "Withdraw completed",
  "transfer.withdraw.failed": "Withdraw failed",
  // "transfer.withdraw.unsettled.tooltip":
  //   "Unsettled balance can not be withdrawn. In order to withdraw, please settle your balance first.",
  // "transfer.withdraw.settlePnl.description":
  //   "Are you sure you want to settle your PnL? Settlement will take up to 1 minute before you can withdraw your available balance.",

  "transfer.internalTransfer.from": "From",
  "transfer.internalTransfer.to": "To",
  "transfer.internalTransfer.currentAssetValue": "Current asset value",
  "transfer.internalTransfer.success": "Funds transferred successfully.",
  "transfer.internalTransfer.failed":
    "Unable to complete transfer. Please try again later.",
  "transfer.internalTransfer.failed.transferInProgress":
    "An internal transfer is currently in progress.",
  "transfer.internalTransfer.failed.withdrawalInProgress":
    "There is a withdrawal in progress.",
  "transfer.internalTransfer.unsettled.tooltip":
    "Unsettled balance can not be transferred. In order to transfer, please settle your balance first.",
  "transfer.internalTransfer.settlePnl.description":
    "Are you sure you want to settle your PnL? <br/> Settlement will take up to 1 minute before you can transfer your available balance.",
};

export type Transfer = typeof transfer;
