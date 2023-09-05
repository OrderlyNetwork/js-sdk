import { WalletAdapter } from "./adapter";
import { BrowserProvider, ethers } from "ethers";

export interface EtherAdapterOptions {
  provider: any;
  label?: string;
  chain: { id: string };
}

export class EtherAdapter implements WalletAdapter {
  private provider?: BrowserProvider;
  private _chainId: number;
  constructor(options: EtherAdapterOptions) {
    console.log("EtherAdapter constructor", options);
    this._chainId = parseInt(options.chain.id, 16);
    this.provider = new BrowserProvider(options.provider, "any");
  }
  getBalance(address: string): Promise<any> {
    throw new Error("Method not implemented.");
  }
  deposit(from: string, to: string, amount: string): Promise<any> {
    throw new Error("Method not implemented.");
  }

  get chainId(): number {
    return this._chainId;
  }

  async send(
    method: string,
    params: Array<any> | Record<string, any>
  ): Promise<any> {
    return await this.provider?.send(method, params);
  }

  async verify(
    data: { domain: any; message: any; types: any },
    signature: string
  ) {
    const { domain, types, message } = data;

    const recovered = ethers.verifyTypedData(domain, types, message, signature);

    console.log("recovered", recovered);
  }
}
