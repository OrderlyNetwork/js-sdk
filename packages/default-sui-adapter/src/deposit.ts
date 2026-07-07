import { Chain, Stage } from "@layerzerolabs/lz-definitions";
import { SDK } from "@layerzerolabs/lz-sui-sdk-v2";
// Keep this package on @mysten/sui v1 while the LayerZero Sui SDK depends on v1.
// TODO: Upgrade this adapter to @mysten/sui v2 once LayerZero supports v2 transactions.
import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { SUI_NETWORK_CONFIG } from "@orderly.network/types";
import {
  extractNativeFeeFromDevInspect,
  summarizeDevInspectReturnValues,
} from "./bcs";
import {
  SUI_DEPOSIT_EXECUTION_GAS,
  SUI_DEPOSIT_QUOTE_PROBE_FEE,
} from "./constants";
import { logSnapshot } from "./debug";
import {
  ResolvedSuiDepositContext,
  SuiDAppKitBridge,
  SuiDepositData,
  SuiSelectedDepositCoins,
} from "./internalTypes";
import {
  bytesFromHex,
  compareBigintDesc,
  normalizeBytes32Hex,
  resolveSuiNetwork,
} from "./suiUtils";
import { SuiWalletProvider } from "./types";

// Boundary between @mysten/sui v1 Transaction values required by LayerZero's
// Sui SDK and the newer dApp Kit wallet connector. Keep these casts localized
// until LayerZero supports v2 transactions and this adapter can move together.
const asLayerZeroSuiClient = (client: SuiClient) => client as any;
const asLayerZeroSuiTransaction = (transaction: Transaction) =>
  transaction as any;

export const signAndExecuteSuiV1Transaction = (
  dAppKit: SuiDAppKitBridge,
  transaction: Transaction,
) => {
  if (typeof dAppKit.signAndExecuteTransaction !== "function") {
    throw new Error("SUI wallet does not support signAndExecuteTransaction");
  }

  return dAppKit.signAndExecuteTransaction({
    transaction,
  });
};

export const lzType3ExecutorLzReceiveOptions = (executionGas: bigint) => {
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

export const summarizeSuiMoveCalls = (moveCalls: any[] = []) =>
  moveCalls.map((moveCall, index) => ({
    index,
    package: moveCall?.function?.package,
    module: moveCall?.function?.module_name,
    function: moveCall?.function?.name,
    typeArguments: moveCall?.type_arguments,
    argumentsCount: moveCall?.arguments?.length ?? 0,
    resultIdsCount: moveCall?.result_ids?.length ?? 0,
    isBuilderCall: moveCall?.is_builder_call,
  }));

const summarizeDevInspectEvents = (events: any[] = []) =>
  events.map((event, index) => ({
    index,
    type: event?.type,
    packageId: event?.packageId,
    transactionModule: event?.transactionModule,
    sender: event?.sender,
    parsedJson: event?.parsedJson,
  }));

const summarizeObjectChanges = (objectChanges: any[] = []) =>
  objectChanges.map((change, index) => ({
    index,
    type: change?.type,
    objectType: change?.objectType,
    objectId: change?.objectId,
    owner: change?.owner,
    previousVersion: change?.previousVersion,
    version: change?.version,
  }));

const summarizeBalanceChanges = (balanceChanges: any[] = []) =>
  balanceChanges.map((change, index) => ({
    index,
    owner: change?.owner,
    coinType: change?.coinType,
    amount: change?.amount,
  }));

const summarizeDevInspectResult = (inspectResult: any) => ({
  error: inspectResult.error,
  effectsStatus: inspectResult.effects?.status,
  gasUsed: inspectResult.effects?.gasUsed,
  resultsCount: inspectResult.results?.length ?? 0,
  returnValueTypes:
    inspectResult.results?.flatMap((result: any) =>
      (result?.returnValues ?? []).map((returnValue: any) =>
        String(returnValue?.[1] ?? ""),
      ),
    ) ?? [],
  events: summarizeDevInspectEvents(inspectResult.events),
  objectChanges: summarizeObjectChanges(inspectResult.objectChanges),
  balanceChanges: summarizeBalanceChanges(inspectResult.balanceChanges),
});

type SuiDepositServiceDeps = {
  getAddress: () => string;
  getChainId: () => number;
  getProvider: () => SuiWalletProvider;
  getClient: () => SuiClient;
  getDAppKit: () => SuiDAppKitBridge;
  getSuiIdentityPublicKey: () => string;
};

export class SuiDepositService {
  constructor(private readonly deps: SuiDepositServiceDeps) {}

  resolveDepositContext(
    depositData: SuiDepositData,
    vaultPackage?: string,
  ): ResolvedSuiDepositContext {
    const provider = this.deps.getProvider();
    const chainId = this.deps.getChainId();
    const network = resolveSuiNetwork(provider.network, chainId);
    const chainVaultPackage = vaultPackage?.trim();
    const expectedChainId =
      network === "mainnet"
        ? SUI_NETWORK_CONFIG.mainnet.chainId
        : SUI_NETWORK_CONFIG.testnet.chainId;
    const config = {
      chainId: expectedChainId,
      vaultConfig: depositData.vaultConfig?.trim(),
      oapp: depositData.oapp?.trim(),
      executionGas: SUI_DEPOSIT_EXECUTION_GAS,
      vaultPackage: chainVaultPackage,
      network,
      stage: network === "mainnet" ? Stage.MAINNET : Stage.TESTNET,
    };

    logSnapshot("info", "[SuiDepositFee] resolveDepositContext", {
      providerNetwork: provider.network,
      resolvedNetwork: network,
      chainId,
      expectedChainId,
      coinType: depositData.tokenAddress,
      chainVaultPackage,
      vaultPackage: config.vaultPackage,
      vaultConfig: config.vaultConfig,
      oapp: config.oapp,
      executionGas: config.executionGas?.toString(),
    });

    if (expectedChainId !== chainId) {
      throw new Error(`SUI ${network} deposit chain id is not supported`);
    }

    if (
      !config.vaultPackage ||
      !config.vaultConfig ||
      !config.oapp ||
      !config.executionGas
    ) {
      throw new Error(`SUI ${network} deposit config is required`);
    }

    return config as ResolvedSuiDepositContext;
  }

  async selectDepositCoins(
    coinType: string,
    amount: bigint,
  ): Promise<SuiSelectedDepositCoins> {
    const selectedCoins: Array<{ coinObjectId: string; balance: bigint }> = [];
    let totalBalance = BigInt(0);
    let cursor: string | null | undefined;
    const address = this.deps.getAddress();

    do {
      const page = await this.deps.getClient().getCoins({
        owner: address,
        coinType,
        cursor,
      });

      for (const coin of page.data ?? []) {
        const balance = BigInt(coin.balance);
        if (balance <= BigInt(0)) {
          continue;
        }
        selectedCoins.push({
          coinObjectId: coin.coinObjectId,
          balance,
        });
        totalBalance += balance;
        if (totalBalance >= amount) {
          break;
        }
      }

      cursor = page.hasNextPage ? page.nextCursor : null;
    } while (totalBalance < amount && cursor);

    if (totalBalance < amount) {
      throw new Error(
        `Insufficient SUI deposit coin balance. Required ${amount.toString()}, available ${totalBalance.toString()}`,
      );
    }

    selectedCoins.sort((a, b) => compareBigintDesc(a.balance, b.balance));

    const [primaryCoin, ...mergeCoins] = selectedCoins;
    logSnapshot("info", "[SuiDepositFee] selectDepositCoins", {
      sender: address,
      coinType,
      amount: amount.toString(),
      totalBalance: totalBalance.toString(),
      primaryCoinId: primaryCoin.coinObjectId,
      mergeCoinIds: mergeCoins.map((coin) => coin.coinObjectId),
    });

    return {
      primaryCoinId: primaryCoin.coinObjectId,
      mergeCoinIds: mergeCoins.map((coin) => coin.coinObjectId),
      totalBalance,
    };
  }

  async buildDepositTransaction(
    depositData: SuiDepositData,
    lzFee: bigint,
    vaultPackage?: string,
  ) {
    const config = this.resolveDepositContext(depositData, vaultPackage);
    const coinType = depositData.tokenAddress?.trim();

    if (!coinType) {
      throw new Error("SUI deposit coin type is required");
    }

    const address = this.deps.getAddress();
    const publicKey = this.deps.getSuiIdentityPublicKey();
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

    const depositCoins = await this.selectDepositCoins(coinType, amount);

    logSnapshot("info", "[SuiDepositFee] buildDepositTransaction", {
      sender: address,
      coinType,
      accountId,
      brokerHash,
      tokenHash,
      publicKey,
      amount: amount.toString(),
      lzFee: lzFee.toString(),
      primaryCoinId: depositCoins.primaryCoinId,
      mergeCoinIds: depositCoins.mergeCoinIds,
      totalCoinBalance: depositCoins.totalBalance.toString(),
      vaultPackage: config.vaultPackage,
      vaultConfig: config.vaultConfig,
      oapp: config.oapp,
      executionGas: config.executionGas.toString(),
    });

    const tx = new Transaction();
    tx.setSender(address);

    const primaryDepositCoin = tx.object(depositCoins.primaryCoinId);
    if (depositCoins.mergeCoinIds.length > 0) {
      tx.mergeCoins(
        primaryDepositCoin,
        depositCoins.mergeCoinIds.map((coinId) => tx.object(coinId)),
      );
    }
    const [depositCoin] =
      depositCoins.totalBalance === amount
        ? [primaryDepositCoin]
        : tx.splitCoins(primaryDepositCoin, [tx.pure.u64(amount)]);
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

  async populateSuiDepositTransaction(
    tx: Transaction,
    sendCall: any,
    depositData: SuiDepositData,
    vaultPackage?: string,
  ) {
    const address = this.deps.getAddress();
    const config = this.resolveDepositContext(depositData, vaultPackage);
    logSnapshot("info", "[SuiDepositFee] populateSendTransaction:start", {
      sender: address,
      stage: config.stage,
      network: config.network,
    });
    const lz = new SDK({
      chain: Chain.SUI,
      stage: config.stage,
      client: asLayerZeroSuiClient(this.deps.getClient()),
    });
    try {
      const moveCalls = await lz
        .getEndpoint()
        .populateSendTransaction(
          asLayerZeroSuiTransaction(tx),
          sendCall,
          address,
        );
      logSnapshot("info", "[SuiDepositFee] populateSendTransaction:success", {
        sender: address,
        stage: config.stage,
        network: config.network,
        moveCalls: summarizeSuiMoveCalls(moveCalls as any[]),
      });
      return moveCalls;
    } catch (error) {
      logSnapshot("error", "[SuiDepositFee] populateSendTransaction:error", {
        sender: address,
        stage: config.stage,
        network: config.network,
        error,
      });
      throw error;
    }
  }

  async quoteSuiDepositFee(depositData: SuiDepositData, vaultPackage?: string) {
    const address = this.deps.getAddress();
    const client = this.deps.getClient();
    const chainId = this.deps.getChainId();
    const provider = this.deps.getProvider();
    const config = this.resolveDepositContext(depositData, vaultPackage);
    logSnapshot("info", "[SuiDepositFee] quote:start", {
      sender: address,
      chainId,
      providerNetwork: provider.network,
      rpcUrl: provider.rpcUrl,
      vaultPackage: config.vaultPackage,
      probeFee: SUI_DEPOSIT_QUOTE_PROBE_FEE.toString(),
      depositData,
    });

    try {
      const { tx, sendCall } = await this.buildDepositTransaction(
        depositData,
        SUI_DEPOSIT_QUOTE_PROBE_FEE,
        vaultPackage,
      );
      const moveCalls = await this.populateSuiDepositTransaction(
        tx,
        sendCall,
        depositData,
        vaultPackage,
      );

      logSnapshot("info", "[SuiDepositFee] devInspect:start", {
        sender: address,
      });
      const inspectResult = await client.devInspectTransactionBlock({
        sender: address,
        transactionBlock: tx,
      });
      logSnapshot(
        "info",
        "[SuiDepositFee] devInspect:result",
        summarizeDevInspectResult(inspectResult),
      );

      if (inspectResult.error) {
        throw new Error(
          `Failed to quote Sui LayerZero fee: ${inspectResult.error}`,
        );
      }

      let nativeFee: bigint;
      try {
        nativeFee = extractNativeFeeFromDevInspect(inspectResult);
      } catch (extractError) {
        logSnapshot("error", "[SuiDepositFee] quote:parseNativeFee:error", {
          sender: address,
          chainId,
          providerNetwork: provider.network,
          error: extractError,
          probeFee: SUI_DEPOSIT_QUOTE_PROBE_FEE.toString(),
          returnValues: summarizeDevInspectReturnValues(inspectResult),
          moveCalls: summarizeSuiMoveCalls(moveCalls as any[]),
        });
        throw extractError;
      }
      logSnapshot("info", "[SuiDepositFee] quote:success", {
        nativeFee: nativeFee.toString(),
      });
      return nativeFee;
    } catch (error) {
      logSnapshot("error", "[SuiDepositFee] quote:error", {
        sender: address,
        chainId,
        providerNetwork: provider.network,
        depositData,
        error,
      });
      throw error;
    }
  }

  async sendDepositTransaction(
    depositData: SuiDepositData,
    lzFee: bigint,
    vaultPackage?: string,
  ) {
    // TODO: If Sui deposits fail from stale LayerZero quotes, consider adding
    // a small buffer to the quoted fee instead of re-quoting on submit. Sui fee
    // quotes are slow and can be flaky.
    const { tx, sendCall } = await this.buildDepositTransaction(
      depositData,
      lzFee,
      vaultPackage,
    );
    await this.populateSuiDepositTransaction(
      tx,
      sendCall,
      depositData,
      vaultPackage,
    );
    const result = await signAndExecuteSuiV1Transaction(
      this.deps.getDAppKit(),
      tx,
    );

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
}
