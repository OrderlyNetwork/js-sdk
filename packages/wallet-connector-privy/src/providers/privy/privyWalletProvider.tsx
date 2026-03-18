import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePrivy, useSolanaWallets, useWallets } from "@privy-io/react-auth";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useLocalStorage, useTrack, WalletState } from "@orderly.network/hooks";
import { ChainNamespace, TrackerEventName } from "@orderly.network/types";
import { useWalletConnectorPrivy } from "../../provider";
import { ConnectProps, SolanaChainsMap } from "../../types";

interface WalletStatePrivy extends WalletState {
  chain: {
    id: number;
    namespace: ChainNamespace;
  };
}

interface PrivyWalletContextValue {
  connect: (params?: ConnectProps) => void;
  walletEVM: WalletStatePrivy | null;
  walletSOL: WalletStatePrivy | null;
  allWalletsEVM: WalletStatePrivy[];
  allWalletsSOL: WalletStatePrivy[];
  isConnected: boolean;
  switchChain: (chainId: number) => Promise<any>;
  linkedAccount: { type: string; address: string | null } | null;
  exportWallet: (namespace: ChainNamespace, address?: string) => any;
  createEvmWallet: any;
  createSolanaWallet: any;
  selectWallet: (namespace: ChainNamespace, address: string) => void;
  disconnect: () => Promise<void>;
}

const getPrivyEmbeddedWalletChainId = (chainId: string) => {
  if (!chainId) {
    return null;
  }
  return parseInt(chainId.split("eip155:")[1]);
};

const defaultPrivyWalletContextValue: PrivyWalletContextValue = {
  connect: () => {},
  walletEVM: null,
  walletSOL: null,
  allWalletsEVM: [],
  allWalletsSOL: [],
  isConnected: false,
  switchChain: () => Promise.reject(new Error("Privy is disabled")),
  linkedAccount: null,
  exportWallet: () => Promise.reject(new Error("Privy is disabled")),
  createEvmWallet: () => Promise.reject(new Error("Privy is disabled")),
  createSolanaWallet: () => Promise.reject(new Error("Privy is disabled")),
  selectWallet: () => {},
  disconnect: () => Promise.resolve(),
};

const PrivyWalletContext = createContext<PrivyWalletContextValue | null>(null);

export const PrivyWalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { connectorWalletType } = useWalletConnectorPrivy();

  if (connectorWalletType.disablePrivy) {
    return (
      <PrivyWalletContext.Provider value={defaultPrivyWalletContextValue}>
        {children}
      </PrivyWalletContext.Provider>
    );
  }

  return <PrivyWalletProviderInner>{children}</PrivyWalletProviderInner>;
};

const PrivyWalletProviderInner: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { network, solanaInfo, setSolanaInfo, connectorWalletType } =
    useWalletConnectorPrivy();
  const {
    login,
    logout,
    ready,
    authenticated,
    user,
    exportWallet: exportEvmWallet,
    createWallet: createEvmWallet,
  } = usePrivy();
  const { wallets: walletsEVM } = useWallets();
  const connectedRef = useRef(false);

  const {
    ready: solanaReady,
    wallets: walletsSOL,
    createWallet: createSolanaWallet,
    exportWallet: exportSolanaWallet,
  } = useSolanaWallets();

  const [walletEVM, setWalletEVM] = useState<WalletStatePrivy | null>(null);
  const [walletSOL, setWalletSOL] = useState<WalletStatePrivy | null>(null);
  const [allWalletsEVM, setAllWalletsEVM] = useState<WalletStatePrivy[]>([]);
  const [allWalletsSOL, setAllWalletsSOL] = useState<WalletStatePrivy[]>([]);

  const [selectedEvmAddress, setSelectedEvmAddress] = useLocalStorage<string>(
    "privy_selected_evm_address",
    "",
  );
  const [selectedSolAddress, setSelectedSolAddress] = useLocalStorage<string>(
    "privy_selected_sol_address",
    "",
  );

  // Keep a ref map from address → raw Privy EVM wallet for switchChain
  const rawEvmWalletsRef = useRef<Map<string, any>>(new Map());

  const { track } = useTrack();

  const linkedAccount = useMemo(() => {
    const account = user?.linkedAccounts
      ?.filter((item) => item.type !== "wallet" && item.type !== "smart_wallet")
      .sort(
        (a, b) =>
          (b.latestVerifiedAt?.getTime() ?? 0) -
          (a.latestVerifiedAt?.getTime() ?? 0),
      )[0];

    if (!account) {
      return null;
    }

    let address = null;
    if (account.type === "email") {
      address = account.address;
    } else if (account.type === "twitter_oauth") {
      address = `@${account.username}`;
    } else if (account.type === "google_oauth") {
      address = `@${account.name}`;
    } else if (account.type === "telegram") {
      address = `@${account.username}`;
    }

    return {
      type: account.type,
      address,
    };
  }, [user]);

  const switchChain = (chainId: number) => {
    // Use the currently selected EVM wallet's raw Privy object
    const selectedAddress = walletEVM?.accounts[0]?.address;
    const rawWallet = selectedAddress
      ? rawEvmWalletsRef.current.get(selectedAddress)
      : undefined;
    if (rawWallet) {
      return rawWallet.switchChain(chainId);
    }
    // Fallback: try first embedded wallet
    const fallback =
      walletsEVM.find((w) => w.connectorType === "embedded") ?? walletsEVM[0];
    if (fallback) {
      return fallback.switchChain(chainId);
    }
    return Promise.reject("no wallet");
  };

  const connect = (params?: ConnectProps) => {
    if (params?.extraType) {
      login({ loginMethods: [params.extraType as any] });
      return;
    }
    login();
  };

  const disconnect = () => {
    return logout();
  };

  const exportWallet = (namespace: ChainNamespace, address?: string) => {
    if (namespace === ChainNamespace.evm) {
      track(TrackerEventName.clickExportPrivateKey, {
        type: "evm",
      });
      const addr = address ?? walletEVM?.accounts[0]?.address;
      return exportEvmWallet(addr ? { address: addr } : undefined);
    } else if (namespace === ChainNamespace.solana) {
      track(TrackerEventName.clickExportPrivateKey, {
        type: "solana",
      });
      const addr = address ?? walletSOL?.accounts[0]?.address;
      return exportSolanaWallet(addr ? { address: addr } : undefined);
    }
    return Promise.reject("no namespace");
  };

  const selectWallet = useCallback(
    (namespace: ChainNamespace, address: string) => {
      if (namespace === ChainNamespace.evm) {
        const found = allWalletsEVM.find(
          (w) => w.accounts[0]?.address === address,
        );
        if (found) {
          setWalletEVM(found);
          setSelectedEvmAddress(address);
        }
      } else if (namespace === ChainNamespace.solana) {
        const found = allWalletsSOL.find(
          (w) => w.accounts[0]?.address === address,
        );
        if (found) {
          setWalletSOL(found);
          setSelectedSolAddress(address);
        }
      }
    },
    [
      allWalletsEVM,
      allWalletsSOL,
      setSelectedEvmAddress,
      setSelectedSolAddress,
    ],
  );

  const isConnected = useMemo(() => {
    if (ready && authenticated) {
      return true;
    }
    return false;
  }, [ready, authenticated]);

  // Build all EVM wallets
  useEffect(() => {
    if (!authenticated || !walletsEVM || !walletsEVM[0]) {
      setAllWalletsEVM([]);
      setWalletEVM(null);
      return;
    }

    const embeddedWallets = walletsEVM.filter(
      (w) => w.connectorType === "embedded",
    );
    const wallets =
      embeddedWallets.length > 0 ? embeddedWallets : [walletsEVM[0]];

    // Update raw wallet ref
    const newMap = new Map<string, any>();
    for (const w of wallets) {
      newMap.set(w.address, w);
    }
    rawEvmWalletsRef.current = newMap;

    Promise.all(
      wallets.map((w) =>
        w.getEthereumProvider().then(
          (provider: any): WalletStatePrivy => ({
            label: "privy",
            icon: "",
            provider: provider,
            accounts: [{ address: w.address }],
            chains: [
              {
                id: getPrivyEmbeddedWalletChainId(w.chainId) ?? 1,
                namespace: ChainNamespace.evm,
              },
            ],
            chain: {
              id: getPrivyEmbeddedWalletChainId(w.chainId) ?? 1,
              namespace: ChainNamespace.evm,
            },
          }),
        ),
      ),
    )
      .then((builtWallets) => {
        setAllWalletsEVM(builtWallets);

        // Pick selected wallet: persisted address > first wallet
        const preferred = selectedEvmAddress
          ? builtWallets.find(
              (w) => w.accounts[0]?.address === selectedEvmAddress,
            )
          : undefined;
        setWalletEVM(preferred ?? builtWallets[0] ?? null);
      })
      .catch((e) => {
        console.warn("Failed to build EVM wallets", e);
        setAllWalletsEVM([]);
        setWalletEVM(null);
      });
  }, [walletsEVM, authenticated]);

  // Build all SOL wallets
  useEffect(() => {
    if (!authenticated) {
      setAllWalletsSOL([]);
      setWalletSOL(null);
      return;
    }
    if (!solanaReady) {
      return;
    }
    if (!walletsSOL || !walletsSOL[0]) {
      setAllWalletsSOL([]);
      setWalletSOL(null);
      return;
    }

    const embeddedWallets = walletsSOL.filter(
      (w: any) => w.connectorType === "embedded",
    );
    const wallets =
      embeddedWallets.length > 0 ? embeddedWallets : [walletsSOL[0]];

    const builtWallets: WalletStatePrivy[] = wallets.map(
      (w: any): WalletStatePrivy => ({
        label: "privy",
        icon: "",
        provider: {
          signMessage: w.signMessage,
          signTransaction: w.signTransaction,
          sendTransaction: w.sendTransaction,
          network: solanaInfo?.network ?? WalletAdapterNetwork.Devnet,
          rpcUrl: solanaInfo?.rpcUrl ?? undefined,
        },
        accounts: [{ address: w.address }],
        chains: [
          {
            id: SolanaChainsMap.get(network)!,
            namespace: ChainNamespace.solana,
          },
        ],
        chain: {
          id: SolanaChainsMap.get(network)!,
          namespace: ChainNamespace.solana,
        },
      }),
    );

    setAllWalletsSOL(builtWallets);

    // Pick selected wallet: persisted address > first wallet
    const preferred = selectedSolAddress
      ? builtWallets.find((w) => w.accounts[0]?.address === selectedSolAddress)
      : undefined;
    setWalletSOL(preferred ?? builtWallets[0] ?? null);
  }, [walletsSOL, authenticated, solanaReady, network, solanaInfo]);

  useEffect(() => {
    if (isConnected && linkedAccount) {
      if (connectedRef.current) {
        return;
      }
      connectedRef.current = true;
      track(TrackerEventName.socialLoginSuccess, {
        type: linkedAccount.type,
        address: linkedAccount.address,
      });
    }
  }, [isConnected, linkedAccount, connectedRef]);

  const value = useMemo(
    () => ({
      connect,
      walletEVM,
      walletSOL,
      allWalletsEVM,
      allWalletsSOL,
      isConnected,
      disconnect,
      switchChain,
      linkedAccount,
      exportWallet,
      createEvmWallet,
      createSolanaWallet,
      selectWallet,
    }),
    [
      connect,
      walletEVM,
      walletSOL,
      allWalletsEVM,
      allWalletsSOL,
      isConnected,
      disconnect,
      switchChain,
      linkedAccount,
      exportWallet,
      createEvmWallet,
      createSolanaWallet,
      selectWallet,
    ],
  );

  return (
    <PrivyWalletContext.Provider value={value}>
      {children}
    </PrivyWalletContext.Provider>
  );
};

export function usePrivyWallet() {
  const context = useContext(PrivyWalletContext);
  if (!context) {
    throw new Error("usePrivyWallet must be used within a PrivyWalletProvider");
  }
  return context;
}
