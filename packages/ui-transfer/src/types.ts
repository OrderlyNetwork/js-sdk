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
  Increase,
}

export type InputStatus = "error" | "warning" | "success" | "default";
