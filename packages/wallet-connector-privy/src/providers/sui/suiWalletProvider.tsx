import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import {
  createDAppKit,
  DAppKitProvider,
  useCurrentAccount,
  useCurrentClient,
  useWalletConnection,
  useWallets,
  type UiWallet,
} from "@mysten/dapp-kit-react";
import { SuiGrpcClient } from "@mysten/sui/grpc";
import { normalizeSuiAddress } from "@mysten/sui/utils";
import { publicKeyFromSuiBytes } from "@mysten/sui/verify";
import { decode as bs58decode, encode as bs58encode } from "bs58";
import { ChainNamespace } from "@orderly.network/types";
import { useWalletConnectorPrivy } from "../../provider";
import { InitSui, Network, SuiChainsMap } from "../../types";

type SuiNetworkName = "mainnet" | "testnet";
type SuiDAppKit = ReturnType<typeof createSuiDAppKit>;
type DefaultDAppKit = React.ComponentProps<typeof DAppKitProvider>["dAppKit"];

function createSuiDAppKit(suiNetwork: SuiNetworkName, rpcUrl: string) {
  return createDAppKit({
    networks: [suiNetwork],
    createClient: (selectedNetwork: SuiNetworkName) =>
      new SuiGrpcClient({
        network: selectedNetwork,
        baseUrl: rpcUrl,
      }),
  });
}

interface SuiWalletProviderProps extends PropsWithChildren {
  disabled: boolean;
  suiConfig?: InitSui;
}

interface SuiWalletChain {
  id: number;
  namespace: ChainNamespace;
}

interface SuiWalletAccount {
  address: string;
  label?: string;
  publicKey?: string;
  rawPublicKey?: string;
  publicKeyScheme?: number;
}

interface SuiWalletProviderValue {
  wallets: UiWallet[];
  wallet: any;
  connectedChain: SuiWalletChain | null;
  connect: (walletName: string) => Promise<void>;
  disconnect: () => Promise<void>;
  isConnected: boolean;
  isConnecting: boolean;
  network: Network;
  suiNetwork: SuiNetworkName;
  rpcUrl: string;
  client: any;
  dAppKit: SuiDAppKit;
  account: SuiWalletAccount | null;
}

const SuiWalletContext = createContext<SuiWalletProviderValue | null>(null);

const disabledSuiWalletValue: SuiWalletProviderValue = {
  wallets: [],
  wallet: null,
  connectedChain: null,
  connect: () => Promise.reject(new Error("SUI wallet connector is disabled")),
  disconnect: () => Promise.resolve(),
  isConnected: false,
  isConnecting: false,
  network: Network.testnet,
  suiNetwork: "testnet",
  rpcUrl: "",
  client: null,
  dAppKit: null as any,
  account: null,
};

const DEFAULT_SUI_RPC: Record<SuiNetworkName, string> = {
  mainnet: "https://fullnode.mainnet.sui.io:443",
  testnet: "https://fullnode.testnet.sui.io:443",
};

const getSuiWalletChain = (network: SuiNetworkName): `sui:${SuiNetworkName}` =>
  `sui:${network}`;

// Sui wallets should expose these Wallet Standard features to support connect,
// signing, and transaction flows used by the connector.
const requiredSuiWalletFeatures = [
  "sui:signPersonalMessage",
  "sui:signAndExecuteTransaction",
  "sui:signTransaction",
] as const;

const SUI_ED25519_SIGNATURE_FLAG = 0x00;
const SUI_ALLOWED_SIGNATURE_FLAGS = new Set([SUI_ED25519_SIGNATURE_FLAG, 0x01]);
const SUI_KNOWN_SIGNATURE_FLAGS = new Set([0x00, 0x01, 0x02, 0x03, 0x05]);
const SUI_UNSUPPORTED_ACCOUNT_TYPE_ERROR =
  "connector.sui.unsupportedAccountType";

// Phantom can be registered by Wallet Standard and can advertise Sui signing
// features, but advertising those methods does not guarantee compatibility with
// Mysten dApp Kit's connect flow. dApp Kit calls `standard:connect` and expects
// authorized Sui accounts for the configured network. Phantom's current Sui
// integration can fail at that connect step with a generic "Unexpected error",
// so keep it out of the Sui connector list until it is dApp Kit compatible.
const unsupportedSuiWalletNames = new Set(["phantom"]);

const bytesToHex = (bytes: ArrayLike<number>) =>
  Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");

const hexToBytes = (value: string) => {
  const hex = value.startsWith("0x") ? value.slice(2) : value;
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < hex.length; index += 2) {
    bytes[index / 2] = Number.parseInt(hex.slice(index, index + 2), 16);
  }
  return bytes;
};

const normalizeSuiAddressOption = (address?: string) => {
  try {
    return address ? normalizeSuiAddress(address) : undefined;
  } catch {
    return undefined;
  }
};

const toUint8Array = (value: unknown): Uint8Array | undefined => {
  if (value instanceof Uint8Array) {
    return value;
  }

  if (Array.isArray(value)) {
    return Uint8Array.from(value);
  }

  if (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { length?: unknown }).length === "number"
  ) {
    const bytes = value as ArrayLike<number>;
    return Uint8Array.from(
      { length: bytes.length },
      (_, index) => bytes[index],
    );
  }
};

const normalizeSuiPublicKeyData = (
  value: unknown,
  address?: string,
):
  | { publicKey: string; rawPublicKey: string; publicKeyScheme: number }
  | undefined => {
  if (!value) {
    return undefined;
  }

  const valueBytes = toUint8Array(value);
  if (valueBytes) {
    if (valueBytes.length === 32) {
      return {
        publicKey: bs58encode(valueBytes),
        rawPublicKey: `0x${bytesToHex(valueBytes)}`,
        publicKeyScheme: SUI_ED25519_SIGNATURE_FLAG,
      };
    }

    if (valueBytes.length === 33) {
      const rawBytes = valueBytes.slice(1);
      return {
        publicKey: bs58encode(rawBytes),
        rawPublicKey: `0x${bytesToHex(rawBytes)}`,
        publicKeyScheme: valueBytes[0],
      };
    }

    if (SUI_KNOWN_SIGNATURE_FLAGS.has(valueBytes[0])) {
      const rawBytes = valueBytes.slice(1);
      return {
        publicKey: bs58encode(rawBytes),
        rawPublicKey: `0x${bytesToHex(rawBytes)}`,
        publicKeyScheme: valueBytes[0],
      };
    }
  }

  if (typeof value === "string") {
    const hex = value.startsWith("0x") ? value.slice(2) : value;
    if (/^[0-9a-fA-F]{64}$/.test(hex)) {
      const rawBytes = hexToBytes(hex);
      return {
        publicKey: bs58encode(rawBytes),
        rawPublicKey: `0x${bytesToHex(rawBytes)}`,
        publicKeyScheme: SUI_ED25519_SIGNATURE_FLAG,
      };
    }

    if (/^[0-9a-fA-F]{66}$/.test(hex)) {
      const bytes = hexToBytes(hex);
      const rawBytes = bytes.slice(1);
      return {
        publicKey: bs58encode(rawBytes),
        rawPublicKey: `0x${bytesToHex(rawBytes)}`,
        publicKeyScheme: bytes[0],
      };
    }

    if (/^[0-9a-fA-F]{68,}$/.test(hex)) {
      const bytes = hexToBytes(hex);
      if (SUI_KNOWN_SIGNATURE_FLAGS.has(bytes[0])) {
        const rawBytes = bytes.slice(1);
        return {
          publicKey: bs58encode(rawBytes),
          rawPublicKey: `0x${bytesToHex(rawBytes)}`,
          publicKeyScheme: bytes[0],
        };
      }
    }

    try {
      const decoded = Uint8Array.from(bs58decode(value));
      if (decoded.length === 32) {
        return {
          publicKey: bs58encode(decoded),
          rawPublicKey: `0x${bytesToHex(decoded)}`,
          publicKeyScheme: SUI_ED25519_SIGNATURE_FLAG,
        };
      }
    } catch {
      // fall through to Sui-specific decoding
    }

    try {
      const publicKey = publicKeyFromSuiBytes(value, {
        address: normalizeSuiAddressOption(address),
      });
      const rawBytes = publicKey.toRawBytes();
      const suiBytes = publicKey.toSuiBytes?.();
      return {
        publicKey: bs58encode(rawBytes),
        rawPublicKey: `0x${bytesToHex(rawBytes)}`,
        publicKeyScheme: suiBytes?.[0] ?? SUI_ED25519_SIGNATURE_FLAG,
      };
    } catch {
      return undefined;
    }
  }

  if (typeof value === "object") {
    const publicKey = value as {
      toRawBytes?: () => Uint8Array;
      toSuiBytes?: () => Uint8Array;
      toBytes?: () => Uint8Array;
    };
    const bytes =
      publicKey.toRawBytes?.() ??
      publicKey.toSuiBytes?.() ??
      publicKey.toBytes?.();
    if (bytes) {
      if (bytes.length === 32) {
        return {
          publicKey: bs58encode(bytes),
          rawPublicKey: `0x${bytesToHex(bytes)}`,
          publicKeyScheme: SUI_ED25519_SIGNATURE_FLAG,
        };
      }

      if (bytes.length === 33) {
        const rawBytes = bytes.slice(1);
        return {
          publicKey: bs58encode(rawBytes),
          rawPublicKey: `0x${bytesToHex(rawBytes)}`,
          publicKeyScheme: bytes[0],
        };
      }

      if (SUI_KNOWN_SIGNATURE_FLAGS.has(bytes[0])) {
        const rawBytes = bytes.slice(1);
        return {
          publicKey: bs58encode(rawBytes),
          rawPublicKey: `0x${bytesToHex(rawBytes)}`,
          publicKeyScheme: bytes[0],
        };
      }
    }
  }

  return undefined;
};

const getSuiPublicKeyScheme = (value: unknown): number | undefined => {
  return normalizeSuiPublicKeyData(value)?.publicKeyScheme;
};

const getSuiAccountPublicKeyValue = (account: unknown, wallet: any) => {
  const currentAccount = account as {
    address?: string;
    publicKey?: unknown;
    rawPublicKey?: unknown;
  };
  const walletAccount = wallet?.accounts?.find(
    (item: { address?: string }) => item.address === currentAccount?.address,
  ) as
    | {
        address?: string;
        publicKey?: unknown;
        rawPublicKey?: unknown;
      }
    | undefined;

  return {
    address: currentAccount?.address,
    publicKeyValue:
      currentAccount?.publicKey ??
      walletAccount?.publicKey ??
      currentAccount?.rawPublicKey ??
      walletAccount?.rawPublicKey,
  };
};

const getSuiAccountPublicKeyData = (account: unknown, wallet: any) => {
  const { address, publicKeyValue } = getSuiAccountPublicKeyValue(
    account,
    wallet,
  );

  return normalizeSuiPublicKeyData(publicKeyValue, address);
};

const getSuiAccountPublicKey = (account: unknown, wallet: any) =>
  getSuiAccountPublicKeyData(account, wallet)?.publicKey;

const getSuiAccountRawPublicKey = (account: unknown, wallet: any) =>
  getSuiAccountPublicKeyData(account, wallet)?.rawPublicKey;

const getSuiAccountPublicKeyScheme = (account: unknown, wallet: any) => {
  const { publicKeyValue } = getSuiAccountPublicKeyValue(account, wallet);
  return getSuiPublicKeyScheme(publicKeyValue);
};

const isSupportedSuiAccountPublicKey = (value: unknown) => {
  const scheme = getSuiPublicKeyScheme(value);
  if (typeof scheme === "undefined") {
    return true;
  }

  return SUI_ALLOWED_SIGNATURE_FLAGS.has(scheme);
};

const assertSupportedSuiAccount = (account?: {
  publicKey?: unknown;
  rawPublicKey?: unknown;
}) => {
  if (
    !isSupportedSuiAccountPublicKey(account?.publicKey ?? account?.rawPublicKey)
  ) {
    throw new Error(SUI_UNSUPPORTED_ACCOUNT_TYPE_ERROR);
  }
};

const isSupportedSuiWallet = (wallet: UiWallet, network: SuiNetworkName) => {
  if (unsupportedSuiWalletNames.has(wallet.name.toLowerCase())) {
    return false;
  }

  if (!wallet.chains.includes(getSuiWalletChain(network))) {
    return false;
  }

  return requiredSuiWalletFeatures.every((feature) =>
    wallet.features.includes(feature),
  );
};

export function SuiWalletProvider({
  children,
  disabled,
  suiConfig,
}: SuiWalletProviderProps) {
  if (disabled || !suiConfig) {
    return (
      <SuiWalletContext.Provider value={disabledSuiWalletValue}>
        {children}
      </SuiWalletContext.Provider>
    );
  }

  return <InitSuiProvider suiConfig={suiConfig}>{children}</InitSuiProvider>;
}

function InitSuiProvider({
  children,
  suiConfig,
}: PropsWithChildren<{ suiConfig: InitSui }>) {
  const { network, setSuiInfo } = useWalletConnectorPrivy();
  const suiNetwork: SuiNetworkName =
    network === Network.mainnet ? "mainnet" : "testnet";
  const rpcUrl =
    suiNetwork === "mainnet"
      ? (suiConfig.mainnetRpc ?? DEFAULT_SUI_RPC.mainnet)
      : (suiConfig.testnetRpc ?? DEFAULT_SUI_RPC.testnet);
  const chainId =
    suiNetwork === "mainnet"
      ? (suiConfig.mainnetChainId ?? SuiChainsMap.get(Network.mainnet) ?? null)
      : (suiConfig.testnetChainId ?? SuiChainsMap.get(Network.testnet) ?? null);

  const dAppKit = useMemo(
    () => createSuiDAppKit(suiNetwork, rpcUrl),
    [rpcUrl, suiNetwork],
  );

  useEffect(() => {
    setSuiInfo({
      rpcUrl,
      network,
      chainId,
    });

    return () => {
      setSuiInfo(null);
    };
  }, [chainId, network, rpcUrl, setSuiInfo]);

  return (
    <DAppKitProvider dAppKit={dAppKit as unknown as DefaultDAppKit}>
      <SuiWalletStateProvider
        dAppKit={dAppKit}
        network={network}
        suiNetwork={suiNetwork}
        rpcUrl={rpcUrl}
        chainId={chainId}
        depositConfig={suiConfig.depositConfig}
        onError={suiConfig.onError}
      >
        {children}
      </SuiWalletStateProvider>
    </DAppKitProvider>
  );
}

function SuiWalletStateProvider({
  children,
  dAppKit,
  network,
  suiNetwork,
  rpcUrl,
  chainId,
  depositConfig,
  onError,
}: PropsWithChildren<{
  dAppKit: SuiDAppKit;
  network: Network;
  suiNetwork: SuiNetworkName;
  rpcUrl: string;
  chainId: number | null;
  depositConfig?: InitSui["depositConfig"];
  onError?: (error: Error) => void;
}>) {
  const detectedWallets = useWallets();
  const connection = useWalletConnection();
  const account = useCurrentAccount();
  const client = useCurrentClient();
  const wallets = useMemo(
    () =>
      detectedWallets.filter((wallet) =>
        isSupportedSuiWallet(wallet, suiNetwork),
      ),
    [detectedWallets, suiNetwork],
  );

  const connect = useCallback(
    async (walletName: string) => {
      const wallet = wallets.find((item) => item.name === walletName);
      if (!wallet) {
        throw new Error(`SUI wallet ${walletName} not found`);
      }
      try {
        const result = await dAppKit.connectWallet({ wallet });
        const account =
          (
            result as
              | {
                  accounts?: Array<{
                    publicKey?: unknown;
                    rawPublicKey?: unknown;
                  }>;
                }
              | undefined
          )?.accounts?.[0] ?? wallet.accounts?.[0];
        assertSupportedSuiAccount(account);
      } catch (error) {
        if ((error as Error).message === SUI_UNSUPPORTED_ACCOUNT_TYPE_ERROR) {
          await dAppKit.disconnectWallet().catch(() => undefined);
        }
        onError?.(error as Error);
        throw error;
      }
    },
    [dAppKit, onError, wallets],
  );

  const disconnect = useCallback(async () => {
    try {
      await dAppKit.disconnectWallet();
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  }, [dAppKit, onError]);

  useEffect(() => {
    if (
      account &&
      !isSupportedSuiAccountPublicKey(
        (account as { publicKey?: unknown; rawPublicKey?: unknown })
          .publicKey ??
          (account as { publicKey?: unknown; rawPublicKey?: unknown })
            .rawPublicKey,
      )
    ) {
      const error = new Error(SUI_UNSUPPORTED_ACCOUNT_TYPE_ERROR);
      dAppKit.disconnectWallet().catch(() => undefined);
      onError?.(error);
    }
  }, [account, dAppKit, onError]);

  const connectedChain = useMemo<SuiWalletChain | null>(() => {
    if (!account || !chainId) {
      return null;
    }

    return {
      id: chainId,
      namespace: ChainNamespace.sui,
    };
  }, [account, chainId]);

  const wallet = useMemo(() => {
    if (!account || !connection.wallet || !connectedChain) {
      return null;
    }
    if (
      !isSupportedSuiAccountPublicKey(
        (account as { publicKey?: unknown; rawPublicKey?: unknown })
          .publicKey ??
          (account as { publicKey?: unknown; rawPublicKey?: unknown })
            .rawPublicKey,
      )
    ) {
      return null;
    }

    const publicKeyData = getSuiAccountPublicKeyData(
      account,
      connection.wallet,
    );
    const publicKey = publicKeyData?.publicKey;
    const rawPublicKey = publicKeyData?.rawPublicKey;
    const publicKeyScheme = getSuiAccountPublicKeyScheme(
      account,
      connection.wallet,
    );

    return {
      label: connection.wallet.name,
      icon: connection.wallet.icon ?? "",
      provider: {
        rpcUrl,
        network: suiNetwork,
        client,
        wallet: connection.wallet,
        account: {
          ...account,
          publicKey,
          rawPublicKey,
          publicKeyScheme,
        },
        depositConfig,
        dAppKit,
      },
      accounts: [
        {
          address: account.address,
          label: account.label,
          publicKey,
          rawPublicKey,
          publicKeyScheme,
        },
      ],
      chains: [connectedChain],
      chain: connectedChain,
    };
  }, [
    account,
    client,
    connectedChain,
    connection.wallet,
    dAppKit,
    depositConfig,
    rpcUrl,
    suiNetwork,
  ]);

  const value = useMemo<SuiWalletProviderValue>(
    () => ({
      wallets,
      wallet,
      connectedChain,
      connect,
      disconnect,
      isConnected: connection.isConnected && !!account,
      isConnecting: connection.isConnecting,
      network,
      suiNetwork,
      rpcUrl,
      client,
      dAppKit,
      account: account
        ? {
            address: account.address,
            label: account.label,
            publicKey: getSuiAccountPublicKey(account, connection.wallet),
            rawPublicKey: getSuiAccountRawPublicKey(account, connection.wallet),
          }
        : null,
    }),
    [
      wallets,
      wallet,
      connectedChain,
      connect,
      disconnect,
      connection.isConnected,
      connection.isConnecting,
      connection.wallet,
      account,
      network,
      suiNetwork,
      rpcUrl,
      client,
      dAppKit,
    ],
  );

  return (
    <SuiWalletContext.Provider value={value}>
      {children}
    </SuiWalletContext.Provider>
  );
}

export function useSuiWallet() {
  const context = useContext(SuiWalletContext);
  if (!context) {
    throw new Error("useSuiWallet must be used within a SuiWalletProvider");
  }
  return context;
}
