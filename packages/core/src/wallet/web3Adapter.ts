import { WalletAdapter } from "./adapter";

export class Web3WalletAdapter implements WalletAdapter {
  constructor(private readonly web3: any) {}

  async getBalance(address: string): Promise<any> {
    const balance = await this.web3.eth.getBalance(address);
    return balance;
  }
  async deposit(from: string, to: string, amount: string): Promise<any> {
    const tx = await this.web3.eth.sendTransaction({
      from,
      to,
      value: amount,
    });
    return tx;
  }
  async send(
    method: string,
    params: Array<any> | Record<string, any>
  ): Promise<any> {
    return this.provider.send(method, params);
  }
}
