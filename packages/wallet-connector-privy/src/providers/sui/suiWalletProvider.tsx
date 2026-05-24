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
import { ChainNamespace } from "@orderly.network/types";
import { useWalletConnectorPrivy } from "../../provider";
import { InitSui, Network, SuiChainsMap } from "../../types";

type SuiNetworkName = "mainnet" | "testnet";

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
  dAppKit: ReturnType<typeof createDAppKit>;
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

const getSuiWalletChain = (network: SuiNetworkName) => `sui:${network}`;

// Sui wallets should expose these Wallet Standard features to support connect,
// signing, and transaction flows used by the connector.
const requiredSuiWalletFeatures = [
  "sui:signPersonalMessage",
  "sui:signAndExecuteTransaction",
  "sui:signTransaction",
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
    () =>
      createDAppKit({
        networks: [suiNetwork],
        createClient: (selectedNetwork: string) =>
          new SuiGrpcClient({
            network: selectedNetwork as SuiNetworkName,
            baseUrl: rpcUrl,
          }),
      }),
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
    <DAppKitProvider dAppKit={dAppKit}>
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
  dAppKit: ReturnType<typeof createDAppKit>;
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
        await dAppKit.connectWallet({ wallet });
      } catch (error) {
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

    return {
      label: connection.wallet.name,
      icon: connection.wallet.icon ?? "",
      provider: {
        rpcUrl,
        network: suiNetwork,
        client,
        wallet: connection.wallet,
        account,
        dAppKit,
      },
      accounts: [
        {
          address: account.address,
          label: account.label,
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
