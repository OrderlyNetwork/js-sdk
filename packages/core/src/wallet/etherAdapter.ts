import { IWalletAdapter, WalletAdapterOptions } from "./adapter";
import { BrowserProvider, ethers, toNumber } from "ethers";
import {
  EthersError,
  getParsedEthersError,
} from "@enzoferey/ethers-error-parser";
import { API } from "@orderly.network/types";

export interface EtherAdapterOptions {
  provider: any;
  wallet: {
    name?: string;
  };
  // getAddresses?: (address: string) => string;
  chain: { id: number };
}

export class EtherAdapter implements IWalletAdapter {
  private provider?: BrowserProvider;
  private _chainId: number;
  private _address: string;
  constructor(options: WalletAdapterOptions) {
    // super();

    // this._chainId = parseInt(options.chain.id, 16);
    this._chainId = options.chain.id;
    this.provider = new BrowserProvider(options.provider, "any");
    this._address = options.address;
  }

  parseUnits(amount: string) {
    return ethers.parseUnits(amount, 6).toString();
  }
  formatUnits(amount: string) {
    return ethers.formatUnits(amount, 6);
  }
  getBalance(userAddress: string): Promise<any> {
    // return contract.balanceOf(userAddress);
    return this.provider!.getBalance(userAddress).then(
      (res) => {
        return res;
      },
      (error) => {}
    );
  }

  deposit(from: string, to: string, amount: string): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async call(
    address: string,
    method: string,
    params: any[],
    options: {
      abi: any;
    }
  ): Promise<any> {
    //
    const singer = await this.provider?.getSigner();
    const contract = new ethers.Contract(address, options.abi, singer);

    return contract[method].apply(null, params).catch((error) => {
      const parsedEthersError = getParsedEthersError(error);

      throw parsedEthersError;
    });
  }

  async callOnChain(
    chain: API.NetworkInfos,
    address: string,
    method: string,
    params: any[],
    options: {
      abi: any;
    }
  ): Promise<any> {
    // const singer = await this.provider?.getSigner();
    // const contract = new ethers.Contract(address, options.abi, singer);

    const provider = new ethers.JsonRpcProvider(chain.public_rpc_url);

    const contract = new ethers.Contract(address, options.abi, provider);

    return contract[method].apply(null, params).catch((error) => {
      const parsedEthersError = getParsedEthersError(error);

      throw parsedEthersError;
    });
  }

  get chainId(): number {
    return this._chainId;
  }

  get addresses(): string {
    return this._address;
  }

  async send(
    method: string,
    params: Array<any> | Record<string, any>
  ): Promise<any> {
    return await this.provider?.send(method, params);
  }

  async sendTransaction(
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
  ): Promise<ethers.TransactionResponse> {
    const singer = await this.provider?.getSigner();
    if (!singer) {
      throw new Error("singer is not exist");
    }

    const contract = new ethers.Contract(
      contractAddress,
      options.abi,
      this.provider
    );

    // contract.interface.getAbiCoder().encode(tx.data);
    const encodeFunctionData = contract.interface.encodeFunctionData(
      method,
      payload.data
    );

    const tx: ethers.TransactionRequest = {
      from: payload.from,
      to: payload.to,
      data: encodeFunctionData,
      value: payload.value,
    };

    // const gas = await this.estimateGas(tx);

    // tx.gasLimit = BigInt(Math.ceil(gas * 1.2));

    try {
      const result = await singer.sendTransaction(tx);

      return result;
    } catch (error) {
      const parsedEthersError = getParsedEthersError(error as EthersError);

      throw parsedEthersError;
    }
  }

  private async estimateGas(tx: ethers.TransactionRequest): Promise<number> {
    const gas = await this.provider!.estimateGas(tx);

    return toNumber(gas);
  }

  async signTypedData(address: string, data: any) {
    return await this.provider?.send("eth_signTypedData_v4", [address, data]);
  }

  async verify(
    data: { domain: any; message: any; types: any },
    signature: string
  ) {
    const { domain, types, message } = data;

    const recovered = ethers.verifyTypedData(domain, types, message, signature);
  }

  on(eventName: any, listener: any): void {
    this.provider?.on(eventName, listener);
  }

  off(eventName: any, listener: any): void {
    this.provider?.off(eventName, listener);
  }

  getContract(address: string, abi: any): ethers.Contract {
    const contract = new ethers.Contract(address, abi, this.provider);
    return contract;
  }
}
