import type { BigNumberish } from "ethers/src.ts/utils";
import { API, ChainNamespace } from "@orderly.network/types";
import { SignatureDomain } from "../utils";

export type ChainType = "EVM" | "SOL";

export interface Message {
  message: {
    chainType: ChainType;
    [key: string]: any;
  };
  signatured: string;
}

// Define types for inputs
export type RegisterAccountInputs = {
  // chainId: number;
  brokerId: string;
  // chainType: ChainType;
  // scope: string;
  registrationNonce: number;
  // expiration: number;
  timestamp: number;
};

export type WithdrawInputs = {
  // chainId: number;
  brokerId: string;
  receiver: string;
  token: string;
  amount: string;
  nonce: number;
  timestamp: number;
  // chainType: ChainType;
  // domain: SignatureDomain;
  verifyContract?: string;
};

export type SettleInputs = {
  // chainId: number;
  brokerId: string;
  settlePnlNonce: string;
  timestamp: number;
  // chainType: ChainType;
  // domain: any;
  verifyContract?: string;
};

export type AddOrderlyKeyInputs = {
  // chainId: number;
  publicKey: string;
  brokerId: string;
  expiration: number;
  timestamp: number;
  // domain: SignatureDomain;
  scope?: string;
  // chainType: ChainType;
  tag?: string;
  /** @since 2.3.0, when create orderly key for sub account, it's required */
  subAccountId?: string;
};

export interface WalletAdapter<Config = any> {
  chainNamespace: ChainNamespace;

  get chainId(): number;

  get address(): string;

  set chainId(chainId: number);

  set address(addresses: string);

  //---- lifecycles ----
  active(config: Config): void;

  update(config: Config): void;

  deactivate(): void;

  generateSecretKey(): string;

  /**
   * business methods
   */
  generateRegisterAccountMessage(
    inputs: RegisterAccountInputs,
  ): Promise<Message>;

  generateWithdrawMessage(
    inputs: WithdrawInputs,
  ): Promise<Message & { domain: SignatureDomain }>;

  generateSettleMessage(
    inputs: SettleInputs,
  ): Promise<Message & { domain: SignatureDomain }>;

  generateAddOrderlyKeyMessage(inputs: AddOrderlyKeyInputs): Promise<Message>;

  // withdraw(inputs: WithdrawInputs): Promise<Message>;

  /**
   * ===== general methods =====
   */

  /**
   * call contract
   */
  call(
    address: string,
    method: string,
    params: any[],
    options?: {
      abi: any;
    },
  ): Promise<any>;

  /**
   * send transaction
   */
  sendTransaction(
    contractAddress: string,
    method: string,
    payload: {
      from: string;
      to?: string;
      data: any[];
      value?: bigint;
    },
    options: {
      abi: any;
    },
  ): Promise<any>;

  callOnChain(
    chain: API.NetworkInfos,
    address: string,
    method: string,
    params: any[],
    options: {
      abi: any;
    },
  ): Promise<any>;

  getBalance(): Promise<bigint>;

  pollTransactionReceiptWithBackoff(
    txHash: string,
    baseInterval?: number,
    maxInterval?: number,
    maxRetries?: number,
  ): Promise<any>;

  parseUnits: (amount: string, decimals: number) => string;
  formatUnits: (amount: BigNumberish, decimals: number) => string;

  on(eventName: string, listener: (...args: any[]) => void): void;

  off(eventName: string, listener: (...args: any[]) => void): void;
}
