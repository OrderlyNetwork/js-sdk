export interface WalletAdapter {
//   get address(): string;
  getBalance: (address:string) => Promise<any>;
  deposit: (from:string,to:string,amount:string) => Promise<any>;

  
}
