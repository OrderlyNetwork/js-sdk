// Keep this package on @mysten/sui v1 while the LayerZero Sui SDK depends on v1.
// TODO: Upgrade this adapter to @mysten/sui v2 once LayerZero supports v2 transactions.
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
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
  normalizeSuiPublicKeyToBase58,
  normalizeSuiPublicKeyToBytes32Hex,
} from "@orderly.network/core";
import {
  API,
  ChainNamespace,
  DEFAUL_ORDERLY_KEY_SCOPE,
  MaxUint256,
  isNativeTokenChecker,
} from "@orderly.network/types";
import {
  DEFAULT_RECEIPT_BASE_INTERVAL,
  DEFAULT_RECEIPT_MAX_INTERVAL,
  DEFAULT_RECEIPT_MAX_RETRIES,
  SUI_SIGNATURE_VERSION,
} from "./constants";
import { SuiDepositService } from "./deposit";
import { SuiDAppKitBridge, SuiDepositData } from "./internalTypes";
import {
  buildOffChainSuiDomain,
  buildSuiAddOrderlyKeyText,
  buildSuiRegistrationText,
  buildSuiSettlePnlText,
  buildSuiWithdrawText,
  signSuiPersonalMessage,
} from "./signing";
import {
  hex64,
  normalizeBytes32Hex,
  readSuiBalance,
  resolveSuiNetwork,
  wait,
} from "./suiUtils";
import { SuiAdapterOption, SuiWalletProvider } from "./types";

export {
  buildSuiAddOrderlyKeyText,
  buildSuiRegistrationText,
  buildSuiSettlePnlText,
  buildSuiWithdrawText,
} from "./signing";

const unsupported = (method: string): never => {
  throw new Error(`SUI ${method} is not supported in wallet-connect phase`);
};

class DefaultSuiWalletAdapter extends BaseWalletAdapter<SuiAdapterOption> {
  chainNamespace: ChainNamespace = ChainNamespace.sui;

  private _address!: string;
  private _chainId!: number;
  private _provider!: SuiWalletProvider;
  private _client?: SuiClient;
  private _clientKey?: string;
  private _depositService?: SuiDepositService;

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

  private get client() {
    const network = resolveSuiNetwork(this.provider.network, this.chainId);
    const rpcUrl = this.provider.rpcUrl ?? getFullnodeUrl(network ?? "testnet");
    // Reuse a cached client for the same RPC endpoint so that repeated balance
    // queries, fee quotes, and receipt polling don't keep opening new HTTP
    // connection pools.
    const clientKey = `${network ?? "testnet"}:${rpcUrl}`;
    if (!this._client || this._clientKey !== clientKey) {
      this._client = new SuiClient({ url: rpcUrl });
      this._clientKey = clientKey;
    }
    return this._client;
  }

  private get dAppKit() {
    const dAppKit = this.provider.dAppKit as SuiDAppKitBridge | undefined;

    if (!dAppKit) {
      throw new Error("SUI wallet does not support dApp Kit signing");
    }

    return dAppKit;
  }

  private get depositService() {
    if (!this._depositService) {
      this._depositService = new SuiDepositService({
        getAddress: () => this.address,
        getChainId: () => this.chainId,
        getProvider: () => this.provider,
        getClient: () => this.client,
        getDAppKit: () => this.dAppKit,
        getSuiIdentityPublicKey: () => this.getSuiIdentityPublicKey(),
      });
    }
    return this._depositService;
  }

  private setConfig(config: SuiAdapterOption): void {
    this._address = config.address;
    this._chainId = config.chain.id;
    this._provider = config.provider;
  }

  getPublicKey(): string | undefined {
    return normalizeSuiPublicKeyToBase58(
      this.provider.account?.publicKey ?? this.provider.account?.rawPublicKey,
    );
  }

  getRawPublicKey(): string | undefined {
    return normalizeSuiPublicKeyToBytes32Hex(
      this.provider.account?.rawPublicKey ?? this.provider.account?.publicKey,
    );
  }

  private async signPersonalMessage(text: string) {
    return signSuiPersonalMessage({
      text,
      address: this.address,
      account: this.provider.account,
      accountBase58PublicKey: this.getPublicKey(),
      dAppKit: this.dAppKit,
    });
  }

  private getSuiIdentityPublicKey() {
    return normalizeBytes32Hex(this.getRawPublicKey());
  }

  active(config: SuiAdapterOption): void {
    this.setConfig(config);
  }

  deactivate(): void {
    this._address = "";
    this._chainId = 0;
    // Drop the cached SuiClient so subsequent reconnects build a fresh one
    // against the (possibly different) network instead of reusing a stale pool.
    this._client = undefined;
    this._clientKey = undefined;
    this._depositService = undefined;
    // Clear the wallet provider so any post-deactivate call into `provider`,
    // `getPublicKey()`, or signing methods is rejected by the `provider` getter
    // guard instead of silently operating on the stale (disconnected) account.
    this._provider = undefined!;
  }

  update(config: SuiAdapterOption): void {
    this.setConfig(config);
  }

  async generateRegisterAccountMessage(
    inputs: RegisterAccountInputs,
  ): Promise<Message> {
    const domain = buildOffChainSuiDomain(this.chainId);
    const message = {
      brokerId: inputs.brokerId,
      chainId: this.chainId,
      timestamp: inputs.timestamp,
      registrationNonce: inputs.registrationNonce,
      chainType: "SUI" as const,
      signatureVersion: SUI_SIGNATURE_VERSION,
    };

    const signature = await this.signPersonalMessage(
      buildSuiRegistrationText(domain, message),
    );

    return {
      message,
      signatured: signature,
    };
  }

  async generateWithdrawMessage(inputs: WithdrawInputs): Promise<
    Message & {
      domain: SignatureDomain;
    }
  > {
    if (!inputs.verifyContract) {
      throw new Error("SUI withdraw verifying contract is required");
    }

    const domain = {
      name: "Orderly",
      version: "1",
      chainId: this.chainId,
      verifyingContract: inputs.verifyContract,
    };
    const message = {
      brokerId: inputs.brokerId,
      chainId: this.chainId,
      receiver: hex64(inputs.receiver),
      token: inputs.token,
      amount: inputs.amount,
      fee: (inputs as WithdrawInputs & { fee?: string }).fee ?? "0",
      withdrawNonce: inputs.nonce,
      timestamp: inputs.timestamp,
      chainType: "SUI" as const,
      signatureVersion: SUI_SIGNATURE_VERSION,
    };

    const signature = await this.signPersonalMessage(
      buildSuiWithdrawText(message),
    );

    return {
      message,
      domain,
      signatured: signature,
    };
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

  async generateSettleMessage(inputs: SettleInputs): Promise<
    Message & {
      domain: SignatureDomain;
    }
  > {
    if (!inputs.verifyContract) {
      throw new Error("SUI settle verifying contract is required");
    }

    const domain = {
      name: "Orderly",
      version: "1",
      chainId: this.chainId,
      verifyingContract: inputs.verifyContract,
    };
    const message = {
      brokerId: inputs.brokerId,
      chainId: this.chainId,
      settleNonce: inputs.settlePnlNonce,
      timestamp: inputs.timestamp,
      chainType: "SUI" as const,
      signatureVersion: SUI_SIGNATURE_VERSION,
    };

    const signature = await this.signPersonalMessage(
      buildSuiSettlePnlText(domain, message),
    );

    return {
      message,
      domain,
      signatured: signature,
    };
  }

  async generateAddOrderlyKeyMessage(
    inputs: AddOrderlyKeyInputs,
  ): Promise<Message> {
    const domain = buildOffChainSuiDomain(this.chainId);
    const timestamp = inputs.timestamp;
    const message = {
      brokerId: inputs.brokerId,
      chainId: this.chainId,
      orderlyKey: inputs.publicKey,
      scope: inputs.scope || DEFAUL_ORDERLY_KEY_SCOPE,
      timestamp,
      expiration: timestamp + 1000 * 60 * 60 * 24 * inputs.expiration,
      chainType: "SUI" as const,
      signatureVersion: SUI_SIGNATURE_VERSION,
      ...(typeof inputs.tag !== "undefined" ? { tag: inputs.tag } : {}),
      ...(typeof inputs.subAccountId !== "undefined"
        ? { subAccountId: inputs.subAccountId }
        : {}),
    };

    const signature = await this.signPersonalMessage(
      buildSuiAddOrderlyKeyText(domain, message),
    );

    return {
      message,
      signatured: signature,
    };
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
    const providerClient = this.provider.client;
    const getBalance =
      typeof providerClient?.getBalance === "function"
        ? providerClient.getBalance.bind(providerClient)
        : this.client.getBalance.bind(this.client);
    const balance = await getBalance({
      owner: this.address,
      coinType,
    });

    return readSuiBalance(balance);
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
    contractAddress: string,
    method: string,
    payload: {
      from: string;
      to?: string;
      data: any[];
      value?: bigint;
    },
    _options: {
      abi: any;
    },
  ): Promise<any> {
    if (method !== "deposit") {
      return unsupported(`send transaction:${method}`);
    }

    const depositData = payload.data?.[0] as SuiDepositData | undefined;
    if (!depositData) {
      throw new Error("SUI deposit data is required");
    }

    const lzFee = payload.value ?? BigInt(0);
    if (lzFee <= BigInt(0)) {
      throw new Error("SUI deposit fee quote is required");
    }

    return this.depositService.sendDepositTransaction(
      depositData,
      lzFee,
      contractAddress,
    );
  }

  async callOnChain(
    chain: API.NetworkInfos,
    address: string,
    method: string,
    params: any[],
    _options: {
      abi: any;
    },
  ): Promise<any> {
    if (method !== "getDepositFee") {
      return unsupported(`call on chain:${method}`);
    }

    console.info("[SuiDepositFee] callOnChain:getDepositFee", {
      requestedChainId: chain.chain_id,
      adapterChainId: this.chainId,
      address,
      params,
    });

    if (Number(chain.chain_id) !== this.chainId) {
      throw new Error("SUI deposit fee chain id mismatch");
    }

    const depositData = params?.[1] as SuiDepositData | undefined;
    if (!depositData) {
      throw new Error("SUI deposit data is required");
    }

    return this.depositService.quoteSuiDepositFee(depositData, address);
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
    if (_method === "deposit") {
      return BigInt(0);
    }
    return unsupported("gas estimation");
  }

  async pollTransactionReceiptWithBackoff(
    txHash: string,
    baseInterval = DEFAULT_RECEIPT_BASE_INTERVAL,
    maxInterval = DEFAULT_RECEIPT_MAX_INTERVAL,
    maxRetries = DEFAULT_RECEIPT_MAX_RETRIES,
  ): Promise<any> {
    const client = this.client;
    let interval = baseInterval;
    let lastError: unknown;

    for (let attempt = 0; attempt < maxRetries; attempt += 1) {
      try {
        const tx = await client.getTransactionBlock({
          digest: txHash,
          options: {
            showEffects: true,
          },
        });
        const status = tx?.effects?.status?.status;

        if (status === "success") {
          return { status: 1, transaction: tx };
        }
        if (status === "failure") {
          return { status: 0, transaction: tx };
        }
      } catch (error) {
        lastError = error;
      }

      await wait(interval);
      interval = Math.min(interval * 2, maxInterval);
    }

    throw lastError ?? new Error("SUI transaction receipt polling timed out");
  }

  // SUI does not propagate account/chain changes through this adapter's event
  // bus. Account switches are observed by the React wallet-connector layer
  // (useSuiWallet) and pushed down via switchWallet -> adapter.update, so there
  // is no underlying event source to forward here. These are intentionally
  // no-ops instead of throwing so generic hooks that subscribe on every adapter
  // do not break on the SUI path.
  on(_eventName: string, _listener: (...args: any[]) => void): void {}

  off(_eventName: string, _listener: (...args: any[]) => void): void {}
}

export { DefaultSuiWalletAdapter };
