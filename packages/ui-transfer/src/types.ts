export type DST = {
  symbol: string;
  address?: string;
  decimals?: number;
  chainId?: number;
  network?: string;
};

export enum DepositAction {
  Deposit,
  Approve,
  ApproveAndDeposit,
  // Increase,
}

export enum WithdrawTo {
  /** withdraw to web3 wallet */
  Wallet = "wallet",
  /** withdraw to other account id */
  Account = "accountId",
}

export type InputStatus = "error" | "warning" | "success" | "default";
