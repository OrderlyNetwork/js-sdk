import { Web3Provider } from "@orderly.network/default-evm-adapter";
import { API } from "@orderly.network/types";
import { BrowserProvider, Eip1193Provider, ethers } from "ethers";
import {
  EthersError,
  getParsedEthersError,
} from "@enzoferey/ethers-error-parser";
import { TransactionReceipt } from "ethers/src.ts/providers/provider";

class EthersProvider implements Web3Provider {
  private _provider!: BrowserProvider;

  parseUnits(amount: string, decimals?: number): string {
    return ethers.parseUnits(amount, decimals).toString();
  }

  formatUnits(amount: string, decimals?: number): string {
    return ethers.formatUnits(amount, decimals);
  }

  set provider(provider: Eip1193Provider) {
    this._provider = new BrowserProvider(provider, "any");
  }

  get browserProvider(): BrowserProvider {
    if (!this._provider) {
      throw new Error("browserProvider is not initialized");
    }
    return this._provider;
  }

  async signTypedData(
    address: string,
    toSignatureMessage: any
  ): Promise<string> {
    return await this.browserProvider?.send("eth_signTypedData_v4", [
      address,
      toSignatureMessage,
    ]);
  }

  async call(
    address: string,
    method: string,
    params: any[],
    options: { abi: any }
  ): Promise<any> {
    const singer = await this.browserProvider.getSigner();
    const contract = new ethers.Contract(address, options.abi, singer);

    return contract[method].apply(null, params).catch((error) => {
      const parsedEthersError = getParsedEthersError(error);

      throw parsedEthersError;
    });
  }

  send(method: string, params: Array<any> | Record<string, any>): Promise<any> {
    return this.browserProvider.send(method, params);
  }

  async sendTransaction(
    contractAddress: string,
    method: string,
    payload: { from: string; to?: string; data: any[]; value?: bigint },
    options: { abi: any }
  ): Promise<any> {
    const singer = await this.browserProvider?.getSigner();
    if (!singer) {
      throw new Error("singer is not exist");
    }

    const contract = new ethers.Contract(
      contractAddress,
      options.abi,
      this.browserProvider
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

  async pollTransactionReceiptWithBackoff(
    txHash: string,
    baseInterval = 1000,
    maxInterval = 6000,
    maxRetries = 30
  ) {
    let interval = baseInterval;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const receipt = await this.browserProvider!.getTransactionReceipt(
          txHash
        );
        if (receipt) {
          // completed, get receipt
          return receipt;
        }
      } catch (error) {
        // waiting
      }

      await new Promise((resolve) => setTimeout(resolve, interval));

      interval = Math.min(interval * 2, maxInterval);
      retries++;
    }

    throw new Error("Transaction did not complete after maximum retries.");
  }

  callOnChain(
    chain: API.NetworkInfos,
    address: string,
    method: string,
    params: any[],
    options: { abi: any }
  ): Promise<any> {
    const provider = new ethers.JsonRpcProvider(chain.public_rpc_url);

    const contract = new ethers.Contract(address, options.abi, provider);

    return contract[method].apply(null, params).catch((error) => {
      const parsedEthersError = getParsedEthersError(error);

      throw parsedEthersError;
    });
  }

  getBalance(userAddress: string): Promise<bigint> {
    return this.browserProvider!.getBalance(userAddress).then((res) => {
      return res;
    });
  }
}

export { EthersProvider };
