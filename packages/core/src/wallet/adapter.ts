export interface WalletAdapter {
  //   get address(): string;
  getBalance: (address: string) => Promise<any>;
  deposit: (from: string, to: string, amount: string) => Promise<any>;
  send: (
    method: string,
    params: Array<any> | Record<string, any>
  ) => Promise<any>;
}
