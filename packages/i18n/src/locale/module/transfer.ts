export const transfer = {
  "transfer.deposit": "Deposit",
  "transfer.withdraw": "Withdraw",

  "transfer.network": "Network",
  "transfer.lowestFee": "lowest fee",
  "transfer.web3Wallet": "Your Web3 Wallet",
  "transfer.brokerAccount": "Your {{brokerName}} account",
  "transfer.available.maxQty": "Available: <0>{{maxQty}}</0> {{symbol}}",
  "transfer.max": "Max",

  "transfer.quantity": "Quantity",
  "transfer.quantity.invalid": "Please input a valid number",

  "transfer.deposit.approve.symbol": "Approve {{symbol}}",
  "transfer.deposit.approve.success": "Approve success",
  "transfer.deposit.approve.failed": "Approve failed",
  "transfer.deposit.increase.symbol": "Increase {{symbol}} authorized amount",
  "transfer.deposit.requested": "Deposit requested",
  "transfer.deposit.completed": "Deposit completed",
  "transfer.deposit.failed": "Deposit failed",

  "transfer.fee": "Fee",
  "transfer.feeEqual": "Fee ≈",
  "transfer.fee.destinationGasFee.label": "Destination gas fee: ",
  "transfer.fee.destinationGasFee.description":
    "Additional gas tokens are required to cover operations on the destination chain.",

  "transfer.withdraw.unsupported.chain":
    "Withdrawals are not supported on this chain. Please switch to any of the bridgeless networks.",
  "transfer.withdraw.unsupported.networkName":
    "Withdrawals are not supported on {{networkName}}. Please switch to any of the bridgeless networks.",

  "transfer.withdraw.crossChain.confirm": "Confirm to withdraw",
  "transfer.withdraw.crossChain.recipientAddress": "Recipient address",
  "transfer.withdraw.crossChain.recipientNetwork": "Recipient network",
  "transfer.withdraw.crossChain.withdrawAmount": "Withdraw amount (USDC)",

  "transfer.withdraw.crossChain.process":
    "Your cross-chain withdrawal is being processed...",
  "transfer.withdraw.crossChain.warning":
    "Withdrawals that require cross-chain rebalancing can't be cancelled or followed up with more withdrawals until they've been processed.",
  "transfer.withdraw.crossChain.exceedWarning":
    "Withdrawal exceeds the balance of the {{networkName}} vault ( {{chainVaultBalance}} USDC ). Cross-chain rebalancing fee will be charged for withdrawal to {{networkName}}.",

  "transfer.withdraw.minAmount.error": "quantity must large than {{minAmount}}",

  "transfer.insufficientBalance": "Insufficient balance",
  "transfer.withdraw.rejectTransaction": "REJECTED_TRANSACTION",

  "transfer.withdraw.requested": "Withdraw requested",
  "transfer.withdraw.completed": "Withdraw completed",
  "transfer.withdraw.failed": "Withdraw failed",
};

export type Transfer = typeof transfer;
