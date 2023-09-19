export interface WalletAdapter {
  //   get address(): string;
  get chainId(): number;
  get addresses(): string;
  getBalance: (address: string) => Promise<any>;
  deposit: (from: string, to: string, amount: string) => Promise<any>;
  send: (
    method: string,
    params: Array<any> | Record<string, any>
  ) => Promise<any>;
  // signTypedData: (data: any) => Promise<string>;
}

export type WalletAdapterOptions = {
  provider: any;
  address: string;
  label?: string;
  // getAddresses?: (address: string) => string;
  chain: { id: string };
};

export type getWalletAdapterFunc = (
  options: WalletAdapterOptions
) => WalletAdapter;
