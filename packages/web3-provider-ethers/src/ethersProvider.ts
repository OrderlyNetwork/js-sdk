import {
  EthersError,
  getParsedEthersError,
} from "@enzoferey/ethers-error-parser";
import { BrowserProvider, Eip1193Provider, ethers } from "ethers";
import { TransactionReceipt } from "ethers/src.ts/providers/provider";
import { Web3Provider } from "@orderly.network/default-evm-adapter";
import { API } from "@orderly.network/types";

class EthersProvider implements Web3Provider {
  private _provider!: BrowserProvider;
  private _originalProvider!: Eip1193Provider;

  parseUnits(amount: string, decimals?: number): string {
    return ethers.parseUnits(amount, decimals).toString();
  }

  formatUnits(amount: string, decimals?: number): string {
    return ethers.formatUnits(amount, decimals);
  }

  set provider(provider: Eip1193Provider) {
    this._provider = new BrowserProvider(provider, "any");
    this._originalProvider = provider;
  }

  get browserProvider(): BrowserProvider {
    if (!this._provider) {
      throw new Error("browserProvider is not initialized");
    }
    return this._provider;
  }

  async signTypedData(
    address: string,
    toSignatureMessage: any,
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
    options: { abi: any },
  ): Promise<any> {
    const writeMethod: string[] = ["approve"];
    // @ts-ignore
    if (this._originalProvider.agwWallet && writeMethod.includes(method)) {
      try {
        // @ts-ignore
        const transactionHash = await this._originalProvider.writeContract({
          abi: options.abi,
          address: address,
          functionName: method,
          args: params,
        });

        return {
          hash: transactionHash,
        };
      } catch (error) {
        const parsedEthersError = getParsedEthersError(error as EthersError);
        if ((error as any).message.includes("rejected")) {
          // @ts-ignore
          throw new Error({ content: "REJECTED_TRANSACTION" });
        }
        throw parsedEthersError;
      }
    }
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
    options: { abi: any },
  ): Promise<any> {
    const singer = await this.browserProvider?.getSigner();
    if (!singer) {
      throw new Error("singer is not exist");
    }

    const contract = new ethers.Contract(
      contractAddress,
      options.abi,
      this.browserProvider,
    );

    // contract.interface.getAbiCoder().encode(tx.data);
    const encodeFunctionData = contract.interface.encodeFunctionData(
      method,
      payload.data,
    );

    const tx: ethers.TransactionRequest = {
      from: payload.from,
      to: payload.to,
      data: encodeFunctionData,
      value: payload.value,
    };

    try {
      // for agw wallet
      if (method === "depositTo") {
        // @ts-ignore
        return await this._originalProvider.sendTransaction({
          to: contractAddress,
          data: encodeFunctionData,
          value: payload.value,
        });
      }
      return await singer.sendTransaction(tx);
    } catch (error) {
      const parsedEthersError = getParsedEthersError(error as EthersError);

      throw parsedEthersError;
    }
  }

  async pollTransactionReceiptWithBackoff(
    txHash: string,
    baseInterval = 1000,
    maxInterval = 6000,
    maxRetries = 30,
  ) {
    let interval = baseInterval;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const receipt =
          await this.browserProvider!.getTransactionReceipt(txHash);
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
    options: { abi: any },
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
