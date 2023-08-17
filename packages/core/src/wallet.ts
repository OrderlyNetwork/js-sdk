// export const deposit = async () => {};

// export const getBalance = async () => {};

export interface WalletClient {
  getBalance: () => Promise<any>;
  deposit: () => Promise<any>;
}

/**
 * @deprecated
 */
export abstract class BaseWalletClient implements WalletClient {
  abstract getBalance(): Promise<any>;
  abstract deposit(): Promise<any>;
}
