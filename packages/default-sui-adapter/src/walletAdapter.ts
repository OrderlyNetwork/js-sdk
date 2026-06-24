import { Chain, Stage } from "@layerzerolabs/lz-definitions";
import { SDK } from "@layerzerolabs/lz-sui-sdk-v2";
// Keep this package on @mysten/sui v1 while the LayerZero Sui SDK depends on v1.
// TODO: Upgrade this adapter to @mysten/sui v2 once LayerZero supports v2 transactions.
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Transaction, coinWithBalance } from "@mysten/sui/transactions";
import { fromBase64 } from "@mysten/sui/utils";
import { decode as bs58decode, encode as bs58encode } from "bs58";
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
  DEFAUL_ORDERLY_KEY_SCOPE,
  isNativeTokenChecker,
  MaxUint256,
  SUI_MAINNET_CHAINID,
  SUI_TESTNET_CHAINID,
} from "@orderly.network/types";
import {
  SuiAdapterOption,
  SuiDepositConfig,
  SuiNetworkName,
  SuiWalletProvider,
} from "./types";

const unsupported = (method: string): never => {
  throw new Error(`SUI ${method} is not supported in wallet-connect phase`);
};

const SUI_TESTNET_VAULT_PACKAGE =
  "0x2fad715610f1af18dde2121e2aa35f38bcf88d2e0338f1dbdbe20df5e1e02506";
const SUI_TESTNET_VAULT_CONFIG =
  "0x3e7e1e31ba4e0f6bf44cd0c2001e6332c28e485da478d1d5c9077cb47125df56";
const SUI_TESTNET_OAPP =
  "0xbc737a7a3b81a92b2a6f6c9502d0226c3786dc64f882ef4f85c4408027360649";
const SUI_TESTNET_USDC_TYPE =
  "0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC";
const SUI_MAINNET_USDC_TYPE =
  "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC";
const SUI_DEPOSIT_EXECUTION_GAS = BigInt("100000000");
// Dev-inspect overpay cap used only to let LayerZero build the simulated send PTB;
// the UI and final transaction use the nativeFee parsed from that simulation.
const SUI_DEPOSIT_QUOTE_PROBE_FEE = BigInt("1000000000");
const DEFAULT_RECEIPT_BASE_INTERVAL = 1_000;
const DEFAULT_RECEIPT_MAX_INTERVAL = 10_000;
const DEFAULT_RECEIPT_MAX_RETRIES = 30;
const SUI_SIGNATURE_VERSION = "v2";
const SUI_ALLOWED_SIGNATURE_FLAGS = new Set([0x00, 0x01]);
const SUI_UNSUPPORTED_ACCOUNT_TYPE_ERROR =
  "connector.sui.unsupportedAccountType";
const OFF_CHAIN_VERIFYING_CONTRACT =
  "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC";
const HASH_ORDERLY_NETWORK =
  "0x768a5991f3d52b299dee3ad82f4adaeaa9fb91ffcf7afbecbac40c39201773b4";

type ResolvedSuiDepositConfig = Required<SuiDepositConfig> & {
  network: SuiNetworkName;
  stage: Stage;
};

const DEFAULT_SUI_DEPOSIT_CONFIGS: Record<SuiNetworkName, SuiDepositConfig> = {
  testnet: {
    chainId: SUI_TESTNET_CHAINID,
    vaultPackage: SUI_TESTNET_VAULT_PACKAGE,
    vaultConfig: SUI_TESTNET_VAULT_CONFIG,
    oapp: SUI_TESTNET_OAPP,
    usdcType: SUI_TESTNET_USDC_TYPE,
    executionGas: SUI_DEPOSIT_EXECUTION_GAS,
  },
  mainnet: {
    chainId: SUI_MAINNET_CHAINID,
    usdcType: SUI_MAINNET_USDC_TYPE,
    executionGas: SUI_DEPOSIT_EXECUTION_GAS,
  },
};

type SuiDepositData = {
  accountId?: string;
  brokerHash: string;
  tokenHash: string;
  tokenAmount: string;
  tokenAddress?: string;
};

type SuiSignatureMessage = Record<string, string | number | bigint | undefined>;

const textEncoder = new TextEncoder();

const stripHexPrefix = (value: string) =>
  value.startsWith("0x") ? value.slice(2) : value;

const bytesToHex = (bytes: ArrayLike<number>) =>
  Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");

const bytesFromHex = (hex: string) => Array.from(fromHex(stripHexPrefix(hex)));

const fromHex = (hex: string) => {
  if (hex.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(hex)) {
    throw new Error(`Invalid hex string: ${hex}`);
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
};

const normalizeBytes32Hex = (value?: string) => {
  if (!value) {
    throw new Error("SUI bytes32 value is required");
  }

  const hex = stripHexPrefix(value).toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(hex)) {
    throw new Error(`Invalid SUI bytes32 value: ${value}`);
  }
  return `0x${hex}`;
};

const normalizeSuiBase58PublicKey = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const hex = stripHexPrefix(value).toLowerCase();
  if (/^[0-9a-f]{64}$/.test(hex)) {
    return bs58encode(fromHex(hex));
  }

  try {
    const rawBytes = bs58decode(value);
    if (rawBytes.length === 32) {
      return bs58encode(rawBytes);
    }
  } catch {
    return undefined;
  }

  return undefined;
};

const normalizeSuiRawPublicKey = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const hex = stripHexPrefix(value).toLowerCase();
  if (/^[0-9a-f]{64}$/.test(hex)) {
    return `0x${hex}`;
  }

  try {
    const rawBytes = bs58decode(value);
    if (rawBytes.length === 32) {
      return `0x${bytesToHex(rawBytes)}`;
    }
  } catch {
    return undefined;
  }

  return undefined;
};

const hex64 = (value: string) => {
  const hex = stripHexPrefix(value).toLowerCase();
  if (!/^[0-9a-f]*$/.test(hex) || hex.length > 64) {
    throw new Error(`Invalid SUI hex value: ${value}`);
  }
  return `0x${hex.padStart(64, "0")}`;
};

const bigintString = (value: string | number | bigint | undefined) => {
  if (typeof value === "undefined") {
    throw new Error("SUI message numeric value is required");
  }
  return BigInt(value).toString();
};

const assertEd25519PersonalMessageSignature = (signature: string) => {
  const bytes = fromBase64(signature);
  if (!SUI_ALLOWED_SIGNATURE_FLAGS.has(bytes[0])) {
    throw new Error(SUI_UNSUPPORTED_ACCOUNT_TYPE_ERROR);
  }
};

const assertEd25519WalletAccount = (scheme?: number) => {
  if (
    typeof scheme !== "undefined" &&
    !SUI_ALLOWED_SIGNATURE_FLAGS.has(scheme)
  ) {
    throw new Error(SUI_UNSUPPORTED_ACCOUNT_TYPE_ERROR);
  }
};

const buildOffChainSuiDomain = (chainId: number): SignatureDomain => ({
  name: "Orderly",
  version: "1",
  chainId,
  verifyingContract: OFF_CHAIN_VERIFYING_CONTRACT,
});

const buildDomainLines = (domain: SignatureDomain) => [
  `domain.name:${domain.name}`,
  `domain.version:${domain.version}`,
  `domain.chainId:${domain.chainId}`,
  `domain.verifyingContract:${domain.verifyingContract.toLowerCase()}`,
];

export const buildSuiRegistrationText = (
  domain: SignatureDomain,
  message: SuiSignatureMessage,
) =>
  [
    "Orderly Registration v1",
    ...buildDomainLines(domain),
    `brokerId:${String(message.brokerId)}`,
    `chainId:${bigintString(message.chainId)}`,
    `timestamp:${bigintString(message.timestamp)}`,
    `registrationNonce:${bigintString(message.registrationNonce)}`,
    "",
  ].join("\n");

export const buildSuiAddOrderlyKeyText = (
  domain: SignatureDomain,
  message: SuiSignatureMessage,
) =>
  [
    "Orderly AddOrderlyKey v1",
    ...buildDomainLines(domain),
    `brokerId:${String(message.brokerId)}`,
    `chainId:${bigintString(message.chainId)}`,
    `orderlyKey:${String(message.orderlyKey)}`,
    `scope:${String(message.scope)}`,
    `timestamp:${bigintString(message.timestamp)}`,
    `expiration:${bigintString(message.expiration)}`,
    "",
  ].join("\n");

export const buildSuiWithdrawText = (message: SuiSignatureMessage) =>
  [
    "Orderly Withdraw v1",
    `domain:${hex64(HASH_ORDERLY_NETWORK)}`,
    `brokerId:${String(message.brokerId)}`,
    `tokenSymbol:${String(message.token)}`,
    `chainId:${bigintString(message.chainId)}`,
    `receiver:${hex64(String(message.receiver))}`,
    `tokenAmount:${bigintString(message.amount)}`,
    `fee:${bigintString(message.fee)}`,
    `withdrawNonce:${bigintString(message.withdrawNonce)}`,
    `timestamp:${bigintString(message.timestamp)}`,
    "",
  ].join("\n");

const readU64LE = (bytes: Uint8Array, offset = 0) => {
  let value = BigInt(0);
  for (let i = 0; i < 8; i += 1) {
    value |= BigInt(bytes[offset + i] ?? 0) << BigInt(8 * i);
  }
  return value;
};

const toReturnBytes = (value: string | number[]) =>
  typeof value === "string" ? fromBase64(value) : Uint8Array.from(value);

const lzType3ExecutorLzReceiveOptions = (executionGas: bigint) => {
  if (executionGas <= BigInt(0)) {
    throw new Error("SUI LayerZero execution gas must be greater than 0");
  }

  const gas = new Array<number>(16).fill(0);
  let value = executionGas;
  for (let i = 15; i >= 0; i -= 1) {
    gas[i] = Number(value & BigInt(0xff));
    value >>= BigInt(8);
  }
  return [0x00, 0x03, 0x01, 0x00, 0x11, 0x01, ...gas];
};

const extractNativeFeeFromDevInspect = (inspectResult: any) => {
  for (const result of inspectResult?.results ?? []) {
    for (const returnValue of result?.returnValues ?? []) {
      const type = String(returnValue?.[1] ?? "");
      if (!type.includes("messaging_fee::MessagingFee")) {
        continue;
      }

      const bytes = toReturnBytes(returnValue[0]);
      if (bytes.length < 8) {
        continue;
      }
      return readU64LE(bytes);
    }
  }

  throw new Error("Failed to quote Sui LayerZero fee");
};

const readSuiBalance = (balance: any) =>
  BigInt(
    balance?.totalBalance ??
      balance?.balance?.addressBalance ??
      balance?.balance?.coinBalance ??
      balance?.balance?.balance ??
      0,
  );

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const resolveSuiNetwork = (
  providerNetwork: SuiNetworkName,
  chainId: number,
): SuiNetworkName => {
  if (chainId === SUI_MAINNET_CHAINID) {
    return "mainnet";
  }
  if (chainId === SUI_TESTNET_CHAINID) {
    return "testnet";
  }
  return providerNetwork;
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

  getPublicKey(): string | undefined {
    return normalizeSuiBase58PublicKey(
      this.provider.account?.publicKey ?? this.provider.account?.rawPublicKey,
    );
  }

  getRawPublicKey(): string | undefined {
    return normalizeSuiRawPublicKey(
      this.provider.account?.rawPublicKey ?? this.provider.account?.publicKey,
    );
  }

  private get client() {
    const network = resolveSuiNetwork(this.provider.network, this.chainId);
    const rpcUrl = this.provider.rpcUrl ?? getFullnodeUrl(network ?? "testnet");
    return new SuiClient({
      url: rpcUrl,
    });
  }

  private get dAppKit() {
    const dAppKit = this.provider.dAppKit as
      | {
          signAndExecuteTransaction?: (inputs: {
            transaction: Transaction;
          }) => Promise<any>;
          signPersonalMessage?: (inputs: {
            message: Uint8Array;
          }) => Promise<{ bytes?: string; signature: string }>;
        }
      | undefined;

    if (typeof dAppKit?.signAndExecuteTransaction !== "function") {
      throw new Error("SUI wallet does not support signAndExecuteTransaction");
    }

    return dAppKit;
  }

  private async signPersonalMessage(text: string) {
    if (typeof this.dAppKit.signPersonalMessage !== "function") {
      throw new Error("SUI wallet does not support signPersonalMessage");
    }

    assertEd25519WalletAccount(this.provider.account?.publicKeyScheme);

    const result = await this.dAppKit.signPersonalMessage({
      message: textEncoder.encode(text),
    });

    if (!result?.signature) {
      throw new Error("SUI wallet did not return a personal-message signature");
    }

    assertEd25519PersonalMessageSignature(result.signature);

    return result.signature;
  }

  private getSuiIdentityPublicKey() {
    return normalizeBytes32Hex(this.getRawPublicKey());
  }

  private getDepositConfig(coinType?: string): ResolvedSuiDepositConfig {
    const network = resolveSuiNetwork(this.provider.network, this.chainId);
    const defaultConfig = DEFAULT_SUI_DEPOSIT_CONFIGS[network] ?? {};
    const userConfig = this.provider.depositConfig?.[network] ?? {};
    const config = {
      ...defaultConfig,
      ...userConfig,
      network,
      stage: network === "mainnet" ? Stage.MAINNET : Stage.TESTNET,
    };

    if (config.chainId !== this.chainId) {
      throw new Error(`SUI ${network} deposit chain id is not supported`);
    }

    if (
      !config.vaultPackage ||
      !config.vaultConfig ||
      !config.oapp ||
      !config.usdcType ||
      !config.executionGas
    ) {
      throw new Error(`SUI ${network} deposit config is required`);
    }

    if ((coinType ?? config.usdcType) !== config.usdcType) {
      throw new Error(`Only SUI ${network} USDC deposit is supported`);
    }

    return config as ResolvedSuiDepositConfig;
  }

  private buildDepositTransaction(depositData: SuiDepositData, lzFee: bigint) {
    const config = this.getDepositConfig(depositData.tokenAddress);
    const coinType = depositData.tokenAddress ?? config.usdcType;

    const publicKey = this.getSuiIdentityPublicKey();
    const accountId = normalizeBytes32Hex(depositData.accountId);
    const brokerHash = normalizeBytes32Hex(depositData.brokerHash);
    const tokenHash = normalizeBytes32Hex(depositData.tokenHash);
    const amount = BigInt(depositData.tokenAmount);

    if (amount <= BigInt(0)) {
      throw new Error("SUI deposit amount must be greater than 0");
    }
    if (lzFee < BigInt(0)) {
      throw new Error("SUI LayerZero fee must not be negative");
    }

    const tx = new Transaction();
    tx.setSender(this.address);

    // @mysten/sui v1 uses coinWithBalance; switch to the v2 transaction API
    // when the full Sui deposit path is upgraded together.
    const depositCoin = coinWithBalance({ type: coinType, balance: amount })(
      tx,
    );
    const [lzFeeCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(lzFee)]);

    const sendCall = tx.moveCall({
      target: `${config.vaultPackage}::vault::deposit`,
      typeArguments: [coinType],
      arguments: [
        tx.object(config.vaultConfig),
        tx.object(config.oapp),
        depositCoin,
        tx.pure.vector("u8", bytesFromHex(accountId)),
        tx.pure.vector("u8", bytesFromHex(brokerHash)),
        tx.pure.vector("u8", bytesFromHex(tokenHash)),
        tx.pure.vector("u8", bytesFromHex(publicKey)),
        lzFeeCoin,
        tx.pure.vector(
          "u8",
          lzType3ExecutorLzReceiveOptions(config.executionGas),
        ),
      ],
    });

    return { tx, sendCall };
  }

  private async populateSuiDepositTransaction(tx: Transaction, sendCall: any) {
    const config = this.getDepositConfig();
    const lz = new SDK({
      chain: Chain.SUI,
      stage: config.stage,
      client: this.client as any,
    });
    await lz
      .getEndpoint()
      .populateSendTransaction(tx as any, sendCall, this.address);
  }

  private async quoteSuiDepositFee(depositData: SuiDepositData) {
    const client = this.client;
    const { tx, sendCall } = this.buildDepositTransaction(
      depositData,
      SUI_DEPOSIT_QUOTE_PROBE_FEE,
    );
    await this.populateSuiDepositTransaction(tx, sendCall);

    const inspectResult = await client.devInspectTransactionBlock({
      sender: this.address,
      transactionBlock: tx,
    });
    if (inspectResult.error) {
      throw new Error(
        `Failed to quote Sui LayerZero fee: ${inspectResult.error}`,
      );
    }

    return extractNativeFeeFromDevInspect(inspectResult);
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

  async generateSettleMessage(_inputs: SettleInputs): Promise<
    Message & {
      domain: SignatureDomain;
    }
  > {
    return unsupported("settle");
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
    _contractAddress: string,
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

    const { tx, sendCall } = this.buildDepositTransaction(depositData, lzFee);
    await this.populateSuiDepositTransaction(tx, sendCall);
    const result = await this.dAppKit.signAndExecuteTransaction!({
      transaction: tx,
    });

    if (result?.FailedTransaction) {
      throw new Error(
        result.FailedTransaction.status?.error?.message ??
          "SUI deposit transaction failed",
      );
    }

    const txResult = result?.Transaction ?? result;
    return {
      hash: txResult?.digest,
      digest: txResult?.digest,
      raw: result,
    };
  }

  async callOnChain(
    chain: API.NetworkInfos,
    _address: string,
    method: string,
    params: any[],
    _options: {
      abi: any;
    },
  ): Promise<any> {
    if (method !== "getDepositFee") {
      return unsupported(`call on chain:${method}`);
    }

    if (Number(chain.chain_id) !== this.chainId) {
      throw new Error("SUI deposit fee chain id mismatch");
    }

    const depositData = params?.[1] as SuiDepositData | undefined;
    if (!depositData) {
      throw new Error("SUI deposit data is required");
    }

    return this.quoteSuiDepositFee(depositData);
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

  on(_eventName: string, _listener: (...args: any[]) => void): void {}

  off(_eventName: string, _listener: (...args: any[]) => void): void {}
}

export { DefaultSuiWalletAdapter };
