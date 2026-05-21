import {
  AddOrderlyKeyInputs,
  BaseWalletAdapter,
  DexRequestInputs,
  InternalTransferInputs,
  Message,
  RegisterAccountInputs,
  SettleInputs,
  SignatureDomain,
  WithdrawInputs,
} from "@orderly.network/core";
import {
  API,
  ChainNamespace,
  isNativeTokenChecker,
  MaxUint256,
} from "@orderly.network/types";
import { SuiAdapterOption, SuiWalletProvider } from "./types";

const unsupported = (method: string): never => {
  throw new Error(`SUI ${method} is not supported in wallet-connect phase`);
};

class DefaultSuiWalletAdapter extends BaseWalletAdapter<SuiAdapterOption> {
  chainNamespace: ChainNamespace = "SUI" as ChainNamespace;

  private _address!: string;
  private _chainId!: number;
  private _provider!: SuiWalletProvider;

  get address(): string {
    return this._address;
  }

  get chainId(): number {
    return this._chainId;
  }

  set chainId(chainId: number) {
    this._chainId = chainId;
  }

  private get provider(): SuiWalletProvider {
    if (!this._provider) {
      unsupported("provider");
    }
    return this._provider;
  }

  private setConfig(config: SuiAdapterOption): void {
    this._address = config.address;
    this._chainId = config.chain.id;
    this._provider = config.provider;
  }

  active(config: SuiAdapterOption): void {
    this.setConfig(config);
  }

  deactivate(): void {
    this._address = "";
    this._chainId = 0;
  }

  update(config: SuiAdapterOption): void {
    this.setConfig(config);
  }

  async generateRegisterAccountMessage(
    _inputs: RegisterAccountInputs,
  ): Promise<Message> {
    return unsupported("register account");
  }

  async generateWithdrawMessage(_inputs: WithdrawInputs): Promise<
    Message & {
      domain: SignatureDomain;
    }
  > {
    return unsupported("withdraw");
  }

  async generateInternalTransferMessage(
    _inputs: InternalTransferInputs,
  ): Promise<
    Message & {
      domain: SignatureDomain;
    }
  > {
    return unsupported("internal transfer");
  }

  async generateSettleMessage(_inputs: SettleInputs): Promise<
    Message & {
      domain: SignatureDomain;
    }
  > {
    return unsupported("settle");
  }

  async generateAddOrderlyKeyMessage(
    _inputs: AddOrderlyKeyInputs,
  ): Promise<Message> {
    return unsupported("add orderly key");
  }

  async generateDexRequestMessage(_inputs: DexRequestInputs): Promise<
    Message & {
      domain: SignatureDomain;
    }
  > {
    return unsupported("dex request");
  }

  async getBalance(): Promise<bigint> {
    return this.getBalanceByCoinType();
  }

  async getBalances(addresses: string[]): Promise<bigint[]> {
    const balances = await Promise.all(
      addresses.map((address) =>
        isNativeTokenChecker(address)
          ? this.getBalance()
          : this.getBalanceByCoinType(address),
      ),
    );
    return balances;
  }

  async getBalanceByCoinType(coinType?: string): Promise<bigint> {
    const client = this.provider.client;
    if (typeof client?.getBalance !== "function") {
      throw new Error(
        "SUI balance query is not supported in wallet-connect phase",
      );
    }

    const getBalance = client.getBalance.bind(client);
    const balance = await getBalance({
      owner: this.address,
      coinType,
    });

    return BigInt(balance.totalBalance ?? 0);
  }

  async call(
    address: string,
    method: string,
    _params: any[],
    _options?: {
      abi: any;
    },
  ): Promise<any> {
    if (method === "balanceOf") {
      return this.getBalanceByCoinType(address);
    }

    if (method === "allowance") {
      return MaxUint256;
    }

    return unsupported(`call:${method}`);
  }

  async sendTransaction(
    _contractAddress: string,
    _method: string,
    _payload: {
      from: string;
      to?: string;
      data: any[];
      value?: bigint;
    },
    _options: {
      abi: any;
    },
  ): Promise<any> {
    return unsupported("send transaction");
  }

  async callOnChain(
    _chain: API.NetworkInfos,
    _address: string,
    _method: string,
    _params: any[],
    _options: {
      abi: any;
    },
  ): Promise<any> {
    return unsupported("call on chain");
  }

  async estimateGasFee(
    _contractAddress: string,
    _method: string,
    _payload: {
      from: string;
      to?: string;
      data: any[];
      value?: bigint;
    },
    _options: {
      abi: any;
    },
  ): Promise<bigint> {
    return unsupported("gas estimation");
  }

  async pollTransactionReceiptWithBackoff(
    _txHash: string,
    _baseInterval?: number,
    _maxInterval?: number,
    _maxRetries?: number,
  ): Promise<any> {
    return unsupported("transaction receipt polling");
  }

  on(_eventName: string, _listener: (...args: any[]) => void): void {}

  off(_eventName: string, _listener: (...args: any[]) => void): void {}
}

export { DefaultSuiWalletAdapter };
