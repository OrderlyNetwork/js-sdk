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
import {
  ChainNamespace,
  SUI_NETWORK_CONFIG,
  SUI_UNSUPPORTED_ACCOUNT_TYPE_ERROR_KEY,
} from "@orderly.network/types";
import { useWalletConnectorPrivy } from "../../provider";
import { InitSui, Network } from "../../types";
import {
  assertSupportedSuiAccount,
  getSuiAccountPublicKey,
  getSuiAccountPublicKeyData,
  getSuiAccountPublicKeyScheme,
  getSuiAccountRawPublicKey,
  isSupportedSuiAccountPublicKey,
  SuiWalletAccount,
  SuiWalletProviderAccount,
} from "./suiAccount";

type SuiNetworkName = "mainnet" | "testnet";
type SuiDAppKit = ReturnType<typeof createSuiDAppKit>;
type DefaultDAppKit = React.ComponentProps<typeof DAppKitProvider>["dAppKit"];

function createSuiDAppKit(suiNetwork: SuiNetworkName, rpcUrl: string) {
  return createDAppKit({
    networks: [suiNetwork],
    // Only show Wallet Standard wallets injected by the browser extension.
    // dApp Kit registers a hosted Slush web wallet by default, which opens an
    // external Slush page even when the browser extension is disabled.
    slushWalletConfig: null,
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

interface ConnectedSuiWallet {
  label: string;
  icon: string;
  provider: {
    rpcUrl: string;
    network: SuiNetworkName;
    client: SuiGrpcClient;
    wallet: UiWallet;
    account: SuiWalletProviderAccount;
    dAppKit: SuiDAppKit;
  };
  accounts: SuiWalletAccount[];
  chains: SuiWalletChain[];
  chain: SuiWalletChain;
}

interface SuiWalletProviderValue {
  wallets: UiWallet[];
  wallet: ConnectedSuiWallet | null;
  connectedChain: SuiWalletChain | null;
  connect: (walletName: string) => Promise<void>;
  disconnect: () => Promise<void>;
  isConnected: boolean;
  isConnecting: boolean;
  network: Network;
  suiNetwork: SuiNetworkName;
  rpcUrl: string;
  client: SuiGrpcClient | null;
  dAppKit: SuiDAppKit | null;
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
  dAppKit: null,
  account: null,
};

const getSuiWalletChain = (network: SuiNetworkName): `sui:${SuiNetworkName}` =>
  `sui:${network}`;

// Keep this aligned with the dApp Kit actions that this connector calls.
// dApp Kit supports both current and legacy transaction Wallet Standard feature
// names, so accept either form instead of filtering compatible wallets out.
const requiredSuiWalletFeatureGroups = [
  ["sui:signPersonalMessage"],
  ["sui:signAndExecuteTransaction", "sui:signAndExecuteTransactionBlock"],
] as const;

// Phantom can be registered by Wallet Standard and can advertise Sui signing
// features, but advertising those methods does not guarantee compatibility with
// Mysten dApp Kit's connect flow. dApp Kit calls `standard:connect` and expects
// authorized Sui accounts for the configured network. Phantom's current Sui
// integration can fail at that connect step with a generic "Unexpected error",
// so keep it out of the Sui connector list until it is dApp Kit compatible.
const unsupportedSuiWalletNames = new Set(["phantom"]);

const isSupportedSuiWallet = (wallet: UiWallet, network: SuiNetworkName) => {
  if (unsupportedSuiWalletNames.has(wallet.name.toLowerCase())) {
    return false;
  }

  if (!wallet.chains.includes(getSuiWalletChain(network))) {
    return false;
  }

  return requiredSuiWalletFeatureGroups.every((featureGroup) =>
    featureGroup.some((feature) => wallet.features.includes(feature)),
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
      ? (suiConfig.mainnetRpc ?? SUI_NETWORK_CONFIG.mainnet.rpcUrl)
      : (suiConfig.testnetRpc ?? SUI_NETWORK_CONFIG.testnet.rpcUrl);
  const chainId =
    suiNetwork === "mainnet"
      ? SUI_NETWORK_CONFIG.mainnet.chainId
      : SUI_NETWORK_CONFIG.testnet.chainId;

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
  onError,
}: PropsWithChildren<{
  dAppKit: SuiDAppKit;
  network: Network;
  suiNetwork: SuiNetworkName;
  rpcUrl: string;
  chainId: number | null;
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
        if (
          (error as Error).message === SUI_UNSUPPORTED_ACCOUNT_TYPE_ERROR_KEY
        ) {
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
      const error = new Error(SUI_UNSUPPORTED_ACCOUNT_TYPE_ERROR_KEY);
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

  const wallet = useMemo<ConnectedSuiWallet | null>(() => {
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

    const providerAccount: SuiWalletProviderAccount = {
      ...(account as Record<string, unknown>),
      address: account.address,
      label: account.label,
      publicKey,
      rawPublicKey,
      publicKeyScheme,
    };

    return {
      label: connection.wallet.name,
      icon: connection.wallet.icon ?? "",
      provider: {
        rpcUrl,
        network: suiNetwork,
        client,
        wallet: connection.wallet,
        account: providerAccount,
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
