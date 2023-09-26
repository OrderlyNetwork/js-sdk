import { WalletAdapter, WalletAdapterOptions } from "./adapter";
import Web3 from "web3";

export class Web3WalletAdapter implements WalletAdapter {
  private web3: Web3;
  private _chainId: number;
  constructor(options: WalletAdapterOptions) {
    this.web3 = new Web3(options.provider);
    this._chainId = parseInt(options.chain.id, 16);
  }
  get chainId(): number {
    return this._chainId;
  }
  get addresses(): string {
    throw new Error("Method not implemented.");
  }

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
    // return this.provider.send(method, params);
  }

  async signTypedData(address: string, data: any) {
    return await this.web3.eth.signTypedData(address, data);
  }
}
