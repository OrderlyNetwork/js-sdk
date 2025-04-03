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

  "transfer.crossDeposit.crossSwap.notice":
    "Cross-chain transaction fees will be charged. To avoid these, use our supported <0>Bridgeless networks</0>",
  "transfer.crossDeposit.swap.notice":
    "Please note that swap fees will be charged.",

  "transfer.crossDeposit.bridging": "Bridging",
  "transfer.crossDeposit.bridge": "Bridge",
  "transfer.crossDeposit.bridge.description": "Bridge to Arbirtum via Stargate",
  "transfer.crossDeposit.depositing": "Depositing",
  "transfer.crossDeposit.deposit": "Deposit",
  "transfer.crossDeposit.deposit.description": "Deposit to {{brokerName}}",

  "transfer.crossDeposit.viewStatus": "View status",
  "transfer.crossDeposit.depositFailed":
    "Deposit failed, please try again later.",
  
  "transfer.crossDeposit.slippage": "Slippage",
  "transfer.crossDeposit.slippage.slippageTolerance": "Slippage tolerance",
  "transfer.crossDeposit.slippage.slippageTolerance.description":
    "Your transaction will revert if the price changes unfavorably by more than this percentage.",
  
  "transfer.crossDeposit.swapFee": "Swap fee",
  "transfer.crossDeposit.swapFee.description":
    "WOOFi charges a 0.025% on each swap.",
  "transfer.crossDeposit.bridgeFee": "Bridge fee",
  "transfer.crossDeposit.bridgeFee.description":
    "Stargate charges a fee to bridge your assets.",
  
  "transfer.crossDeposit.minimumReceived": "Minimum received",
  "transfer.crossDeposit.confirmSwap": "Confirm to swap",
  "transfer.crossDeposit.averageSwapTime":
    "Average swap time <0>~ {{time}} mins</0>",
  
  "transfer.crossDeposit.swapDialog.title": "Review swap details",
  "transfer.crossDeposit.viewFAQs": "Need help? <0>View FAQs</0>",
  "transfer.crossDeposit.notEnoughLiquidity":
    "Not enough liquidity. Please try again later or use another chain to deposit.",
};

export type Transfer = typeof transfer;
