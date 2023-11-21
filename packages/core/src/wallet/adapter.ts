import { TransactionRequest, TransactionResponse } from "ethers-v6";

export interface IWalletAdapter {
  //   get address(): string;
  // new (options: WalletAdapterOptions): WalletAdapter;
  get chainId(): number;
  get addresses(): string;
  parseUnits: (amount: string) => string;
  formatUnits: (amount: string) => string;
  // getBalance: (address: string) => Promise<any>;
  // deposit: (from: string, to: string, amount: string) => Promise<any>;
  send: (
    method: string,
    params: Array<any> | Record<string, any>
  ) => Promise<any>;

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
    }
  ): Promise<TransactionResponse>;
  signTypedData: (address: string, data: any) => Promise<string>;

  // 查询余额
  getBalance: (
    // address: string,
    userAddress: string
  ) => Promise<any>;

  call(
    address: string,
    method: string,
    params: any,
    options: {
      abi: any;
    }
  ): Promise<any>;

  on(eventName: any, listener: any): void;
  off(eventName: any, listener: any): void;
}

export type WalletAdapterOptions = {
  provider: any;
  address: string;
  // label?: string;
  // wallet?:{
  //   name:string
  // },
  // getAddresses?: (address: string) => string;
  chain: { id: string };
};

export type getWalletAdapterFunc = (
  options: WalletAdapterOptions
) => IWalletAdapter;
