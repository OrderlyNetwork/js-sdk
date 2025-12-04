import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  usePrivy,
  useSolanaWallets,
  useWallets,
  WalletWithMetadata,
} from "@privy-io/react-auth";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useTrack, WalletState } from "@veltodefi/hooks";
import { ChainNamespace, TrackerEventName } from "@veltodefi/types";
import { useWalletConnectorPrivy } from "../../provider";
import { SolanaChainsMap } from "../../types";

interface WalletStatePrivy extends WalletState {
  chain: {
    id: number;
    namespace: ChainNamespace;
  };
}

interface PrivyWalletContextValue {
  connect: () => void;
  walletEVM: WalletStatePrivy | null;
  walletSOL: WalletStatePrivy | null;
  isConnected: boolean;
  switchChain: (chainId: number) => Promise<any>;
  linkedAccount: { type: string; address: string | null } | null;
  exportWallet: any;
  createEvmWallet: any;
  createSolanaWallet: any;
  disconnect: () => Promise<void>;
}

const getPrivyEmbeddedWalletChainId = (chainId: string) => {
  if (!chainId) {
    return null;
  }
  return parseInt(chainId.split("eip155:")[1]);
};

const defaultUseSolanaWallets = {
  ready: false,
  wallets: [],
  createWallet: () => Promise.resolve(),
  exportWallet: () => Promise.resolve(),
};
const defaultUseWallets = { wallets: [] };

const PrivyWalletContext = createContext<PrivyWalletContextValue | null>(null);

export const PrivyWalletProvider: React.FC<{ children: React.ReactNode }> = ({
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
  const { wallets: walletsEVM } = connectorWalletType.disablePrivy
    ? defaultUseWallets
    : useWallets();
  const connectedRef = useRef(false);

  const {
    ready: solanaReady,
    wallets: walletsSOL,
    createWallet: createSolanaWallet,
    exportWallet: exportSolanaWallet,
  } = connectorWalletType.disablePrivy
    ? defaultUseSolanaWallets
    : useSolanaWallets();

  const [walletEVM, setWalletEVM] = useState<WalletStatePrivy | null>(null);
  const [walletSOL, setWalletSOL] = useState<WalletStatePrivy | null>(null);

  const { track } = useTrack();

  const linkedAccount = useMemo(() => {
    if (user && user.linkedAccounts) {
      const account = user.linkedAccounts
        .filter((item) => item.type !== "wallet")
        .sort(
          (a, b) =>
            (b.latestVerifiedAt?.getTime() ?? 0) -
            (a.latestVerifiedAt?.getTime() ?? 0),
        )[0];
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
        address: address,
      };
    }
    return null;
  }, [user]);

  const switchChain = (chainId: number) => {
    const wallet = walletsEVM[0];
    if (wallet) {
      return wallet.switchChain(chainId);
    }
    return Promise.reject("no wallet");
  };

  const connect = () => {
    login();
  };

  const disconnect = () => {
    return logout();
  };

  const exportWallet = (namespace: ChainNamespace) => {
    console.log("xxxx export wallet", {
      namespace,
    });
    if (namespace === ChainNamespace.evm) {
      track(TrackerEventName.clickExportPrivateKey, {
        type: "evm",
      });
      return exportEvmWallet();
    } else if (namespace === ChainNamespace.solana) {
      track(TrackerEventName.clickExportPrivateKey, {
        type: "solana",
      });
      return exportSolanaWallet();
    }
    return Promise.reject("no namespace");
  };

  const isConnected = useMemo(() => {
    if (ready && authenticated) {
      return true;
    }
    return false;
  }, [ready, authenticated]);

  useEffect(() => {
    if (!authenticated || !walletsEVM || !walletsEVM[0]) {
      setWalletEVM(null);
      return;
    }
    const wallet = walletsEVM[0];
    wallet.getEthereumProvider().then((provider: any) => {
      setWalletEVM({
        label: "privy",
        icon: "",
        provider: provider,
        accounts: [
          {
            address: wallet.address,
          },
        ],
        chains: [
          {
            id: getPrivyEmbeddedWalletChainId(wallet.chainId) ?? 1,
            namespace: ChainNamespace.evm,
          },
        ],
        chain: {
          id: getPrivyEmbeddedWalletChainId(wallet.chainId) ?? 1,
          namespace: ChainNamespace.evm,
        },
      });
    });
  }, [walletsEVM, authenticated]);

  useEffect(() => {
    // console.log('Solana wallet effect triggered:', {
    //   authenticated,
    //   solanaReady,
    //   user,
    //   walletsSOL,
    // });
    if (!authenticated) {
      setWalletSOL(null);
      return;
    }
    if (!solanaReady) {
      return;
    }
    if (!user) {
      return;
    }
    const embededSolanaWallet = (
      user?.linkedAccounts as WalletWithMetadata[]
    ).find(
      (item: WalletWithMetadata) =>
        item.chainType === "solana" && item.connectorType === "embedded",
    );

    if (!embededSolanaWallet) {
      createSolanaWallet().then();
      return;
    }

    if (!walletsSOL || !walletsSOL[0]) {
      return;
    }

    const wallet = walletsSOL.find((w: any) => w.connectorType === "embedded");
    if (wallet) {
      if (walletSOL && wallet.address === walletSOL.accounts[0].address) {
        if (walletSOL.chain.id === SolanaChainsMap.get(network)!) {
          return;
        }
      }

      setWalletSOL({
        label: "privy",
        icon: "",
        provider: {
          signMessage: wallet.signMessage,
          signTransaction: wallet.signTransaction,
          sendTransaction: wallet.sendTransaction,
          network: solanaInfo?.network ?? WalletAdapterNetwork.Devnet,
          rpcUrl: solanaInfo?.rpcUrl ?? undefined,
        },
        accounts: [
          {
            address: wallet.address,
          },
        ],
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
      });
    }
  }, [
    walletsSOL,
    authenticated,
    createSolanaWallet,
    solanaReady,
    user,
    walletSOL,
    network,
    solanaInfo,
  ]);

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
      isConnected,
      disconnect,
      switchChain,
      linkedAccount,
      exportWallet,
      createEvmWallet,
      createSolanaWallet,
    }),
    [
      connect,
      walletEVM,
      walletSOL,
      isConnected,
      disconnect,
      switchChain,
      linkedAccount,
      exportWallet,
      createEvmWallet,
      createSolanaWallet,
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
