export const transfer = {
  "transfer.network": "Network",
  "transfer.lowestFee": "lowest fee",
  "transfer.web3Wallet.your": "Your Web3 Wallet",
  "transfer.web3Wallet.my": "My Web3 wallet",

  "transfer.brokerAccount": "Your {{brokerName}} account",
  "transfer.quantity.invalid": "Please input a valid number",

  "transfer.insufficientBalance": "Insufficient balance",
  "transfer.insufficientAllowance": "Insufficient allowance",
  "transfer.rejectTransaction": "Rejected transaction",

  "transfer.deposit.approve": "Approve",
  "transfer.deposit.approve.success": "Approve success",
  "transfer.deposit.approve.failed": "Approve failed",
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
  "transfer.withdraw.otherAccount": "Other {{brokerName}} account",
  "transfer.withdraw.accountId.tips":
    "Please enter an Account ID instead of a wallet address.",
  "transfer.withdraw.accountId.invalid":
    "Invalid Account ID. Please try again.",

  "transfer.internalTransfer.from": "From",
  "transfer.internalTransfer.to": "To",
  "transfer.internalTransfer.currentAssetValue": "Current asset value",
  "transfer.internalTransfer.success":
    "Success! Funds will be available in 15 seconds.",

  "transfer.internalTransfer.unsettled.tooltip":
    "Unsettled balance can not be transferred. In order to transfer, please settle your balance first.",
  "transfer.internalTransfer.settlePnl.description":
    "Are you sure you want to settle your PnL? <br/> Settlement will take up to 1 minute before you can transfer your available balance.",

  "transfer.internalTransfer.error.default":
    "Unable to complete transfer. Please try again later.",
  "transfer.internalTransfer.error.transferInProgress":
    "An internal transfer is currently in progress.",
  "transfer.internalTransfer.error.withdrawalInProgress":
    "There is a withdrawal in progress.",
  "transfer.internalTransfer.error.transferToSelf":
    "Transfers to your own account are not allowed",
  "transfer.internalTransfer.error.accountIdNotExist":
    "Receiver account ID does not exist.",
  "transfer.internalTransfer.error.transferToSubAccount":
    "Transfers to sub-accounts under different main accounts are not permitted.",
  // "transfer.internalTransfer.error.scopeInsufficient":
  //   "The scope is insufficient",

  // swap deposit
  "transfer.swapDeposit.crossSwap.notice":
    "Cross-chain transaction fees will be charged. To avoid these, use our supported <0>Bridgeless networks</0>",
  "transfer.swapDeposit.swap.notice":
    "Please note that swap fees will be charged.",

  "transfer.swapDeposit.bridging": "Bridging",
  "transfer.swapDeposit.bridge": "Bridge",
  "transfer.swapDeposit.bridge.description": "Bridge to Arbirtum via Stargate",
  "transfer.swapDeposit.depositing": "Depositing",
  "transfer.swapDeposit.deposit": "Deposit",
  "transfer.swapDeposit.deposit.description": "Deposit to {{brokerName}}",

  "transfer.swapDeposit.viewStatus": "View status",
  "transfer.swapDeposit.depositFailed":
    "Deposit failed, please try again later.",

  "transfer.slippage": "Slippage",
  "transfer.slippage.slippageTolerance": "Slippage tolerance",
  "transfer.slippage.slippageTolerance.description":
    "Your transaction will revert if the price changes unfavorably by more than this percentage.",

  "transfer.swapDeposit.swapFee": "Swap fee",
  "transfer.swapDeposit.swapFee.description":
    "WOOFi charges a 0.025% on each swap.",
  "transfer.swapDeposit.bridgeFee": "Bridge fee",
  "transfer.swapDeposit.bridgeFee.description":
    "Stargate charges a fee to bridge your assets.",

  "transfer.swapDeposit.minimumReceived": "Minimum received",
  "transfer.swapDeposit.confirmSwap": "Confirm to swap",
  "transfer.swapDeposit.averageSwapTime":
    "Average swap time <0>~ {{time}} mins</0>",

  "transfer.swapDeposit.swapDialog.title": "Review swap details",
  "transfer.swapDeposit.viewFAQs": "Need help? <0>View FAQs</0>",
  "transfer.swapDeposit.notEnoughLiquidity":
    "Not enough liquidity. Please try again later or use another chain to deposit.",

  "transfer.convert.completed": "Convert completed",
  "transfer.convert.failed": "Convert failed",
  "transfer.deposit.convertRate": "Convert rate",
  "transfer.convert.convertAssets": "Convert assets to USDC",
  "transfer.deposit.collateralContribution": "Collateral contribution",
  "transfer.withdraw.InsufficientVaultBalance": "Insufficient vault balance",

  "transfer.LTV": "LTV",
  "transfer.LTV.description": `LTV (Loan-to-Value) is the ratio between your negative USDC and the current value of your collateral. If your LTV exceeds {{threshold}}, your collateral will be automatically converted to USDC.`,
  "transfer.LTV.tooltip": `If your LTV exceeds {{threshold}}% or your USDC balance plus Unsettled PnL falls below {{usdcThreshold}}, your collateral will be automatically converted with a haircut. To avoid this, you can manually convert assets to USDC.`,
  "transfer.LTV.currentLTV": "Current LTV",
  "transfer.convert": "Convert",
  // "transfer.convert.note": "Please note that convert fees will be charged.",
  "transfer.deposit.userMaxQty.error":
    "Collateral cap reached. Maximum allowed: {{maxQty}} {{token}}.",
  "transfer.deposit.gasFee.error":
    "Please ensure you have enough {{token}} for gas fees.",

  "transfer.deposit.status.pending.one": "You have a pending transaction",
  "transfer.deposit.status.pending.multiple": "You have pending transactions",
  "transfer.deposit.status.completed.one": "You have a successful transaction",
  "transfer.deposit.status.completed.multiple":
    "You have successful transactions",
};

export type Transfer = typeof transfer;
