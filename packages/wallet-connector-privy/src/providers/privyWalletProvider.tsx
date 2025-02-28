import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { LinkedAccountWithMetadata, usePrivy, useSolanaWallets, useWallets, WalletWithMetadata } from "@privy-io/react-auth";
import { Connection } from "@solana/web3.js";
import { ChainNamespace, EnumTrackerKeys } from "@orderly.network/types";
import { useTrack, WalletState } from "@orderly.network/hooks";
import { SolanaChainsMap } from "../types";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useWalletConnectorPrivy } from "../provider";


interface WalletStatePrivy extends WalletState {
  chain: {
    id: number;
    namespace: ChainNamespace;
  }
}


interface PrivyWalletContextValue {
  connect: () => void;
  walletEVM: WalletStatePrivy | null;
  walletSOL: WalletStatePrivy | null;
  isConnected: boolean;
  switchChain: (chainId: number) => Promise<any>;
  linkedAccount: { type: string; address: string | null } | null;
  exportWallet: any;
  disconnect: () => Promise<void>;
}

const getPrivyEmbeddedWalletChainId = (chainId: string) => {
  if (!chainId) {
    return null;
  }
  return parseInt(chainId.split("eip155:")[1]);
};


const PrivyWalletContext = createContext<PrivyWalletContextValue | null>(null);

export const PrivyWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { network } = useWalletConnectorPrivy();
  const { login, logout, ready, authenticated, user, exportWallet: exportEvmWallet } = usePrivy();
  const { wallets: walletsEVM } = useWallets();
  const connectedRef = useRef(false);


  const {
    ready: solanaReady,
    wallets: walletsSOL,
    createWallet: createSolanaWallet,
    exportWallet: exportSolanaWallet,
  } = useSolanaWallets();
  const connection = useMemo(() => {

    return new Connection('https://caryl-ukn4ci-fast-devnet.helius-rpc.com');

  }, [])

  const [walletEVM, setWalletEVM] = useState<WalletStatePrivy | null>(null);
  const [walletSOL, setWalletSOL] = useState<WalletStatePrivy | null>(null);

  const { track} = useTrack();

  const linkedAccount = useMemo(() => {

    if (user && user.linkedAccounts) {
      const account = user.linkedAccounts[0];
      return {
        type: account.type,
        address: 'number' in account ? account.number : ('address' in account ? account.address : null),
      }
    }
    return null;
  }, [user]);


  const switchChain = (chainId: number) => {
    const wallet = walletsEVM[0];
    if (wallet) {
      return wallet.switchChain(chainId)
    }
    return Promise.reject("no wallet");
  };

  const connect = () => {
    login();
  };

  const disconnect = () => {
    return logout();
  }

  const exportWallet = (namespace: ChainNamespace) => {
    console.log('xxxx export wallet', {
      namespace,
    });
    if (namespace === ChainNamespace.evm) {
      track(EnumTrackerKeys.CLICK_EXPORT_PRIVATE_KEY, {
        type: "evm",
      });
      return exportEvmWallet();
    } else if (namespace === ChainNamespace.solana) {
      track(EnumTrackerKeys.CLICK_EXPORT_PRIVATE_KEY, {
        type: "solana",
      });
      return exportSolanaWallet();
    }
    return Promise.reject("no namespace");
  }

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
    const embededSolanaWallet = (user?.linkedAccounts as WalletWithMetadata[]).find(
      (item: WalletWithMetadata) => item.chainType === 'solana' && item.connectorType === 'embedded'
    );

    if (!embededSolanaWallet) {
      createSolanaWallet().then();
      return;
    }

    if (!walletsSOL || !walletsSOL[0]) {
      return;
    }

    const wallet = walletsSOL.find((w: any) => w.connectorType === 'embedded');
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
          network: network === "mainnet" ? WalletAdapterNetwork.Mainnet : WalletAdapterNetwork.Devnet,
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


  }, [walletsSOL, authenticated, createSolanaWallet, connection, solanaReady, user, walletSOL, network]);


  useEffect(() => {
    if (isConnected && linkedAccount) {
      if (connectedRef.current) {
        return;
      }
      connectedRef.current = true;
      track(EnumTrackerKeys.SOCIAL_LOGIN_SUCCESS, {
        type: linkedAccount.type,
        address: linkedAccount.address,
      });
    }
  }, [isConnected, linkedAccount, connectedRef]);

  
  const value = useMemo(() => ({
    connect,
    walletEVM,
    walletSOL,
    isConnected,
    disconnect,
    switchChain,
    linkedAccount,
    exportWallet
  }), [connect, walletEVM, walletSOL, isConnected, disconnect, switchChain, linkedAccount, exportWallet]);

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