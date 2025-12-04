import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { WalletAdapterNetwork, WalletName } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useStorageLedgerAddress } from "@veltodefi/hooks";
import { ChainNamespace } from "@veltodefi/types";
import { useWalletConnectorPrivy } from "../../provider";
import { useSolanaWalletStore } from "../../stores/solanaWalletStore";
import { SolanaChainsMap } from "../../types";

interface SolanaWalletContextValue {
  wallets: any[];
  connectedChain: { id: number; namespace: ChainNamespace } | null;
  connect: (walletName: string) => Promise<any>;
  wallet: any;
  disconnect: () => void;
  isConnected: boolean;
}

const defaultUseSolanaWallet = {
  wallets: [],
  select: () => Promise.resolve(),
  connect: () => Promise.resolve(),
  wallet: null,
  publicKey: null,
  signMessage: () => Promise.resolve(),
  signTransaction: () => Promise.resolve(),
  sendTransaction: () => Promise.resolve(),
  disconnect: () => Promise.resolve(),
};

const SolanaWalletContext = createContext<SolanaWalletContextValue | null>(
  null,
);

export const SolanaWalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { setLedgerAddress } = useStorageLedgerAddress();
  const { network, solanaInfo, connectorWalletType } =
    useWalletConnectorPrivy();

  const {
    wallets,
    select,
    connect: connectSolana,
    wallet: walletSolana,
    publicKey,
    signMessage,
    signTransaction,
    sendTransaction,
    disconnect: disconnectSolana,
  } = connectorWalletType.disableSolana ? defaultUseSolanaWallet : useWallet();

  const {
    wallet,
    connect,
    disconnect: disconnectWallet,
    setWallet,
    setWalletMethods,
    isManual,
  } = useSolanaWalletStore();

  useEffect(() => {
    if (!walletSolana || isManual) return;

    if (!publicKey) {
      return;
    }

    const newWallet = {
      label: walletSolana.adapter.name,
      icon: "",
      provider: {
        rpcUrl: solanaInfo?.rpcUrl ?? null,
        network: solanaInfo?.network ?? WalletAdapterNetwork.Devnet,
        signMessage,
        signTransaction,
        sendTransaction,
      },
      accounts: [
        {
          address: publicKey.toBase58(),
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
    };

    if (walletSolana.adapter.name === "Ledger") {
      setLedgerAddress(publicKey.toBase58());
    }

    setWallet(newWallet);
  }, [
    publicKey,
    walletSolana,
    signMessage,
    signTransaction,
    sendTransaction,
    solanaInfo,
    isManual,
  ]);

  useEffect(() => {
    setWalletMethods({
      select,
      connectSolana,
      walletSolana,
      publicKey,
      signMessage,
      signTransaction,
      sendTransaction,
      disconnectSolana,
      network,
      solanaInfo,
    });
  }, [
    select,
    connectSolana,
    walletSolana,
    publicKey,
    signMessage,
    signTransaction,
    sendTransaction,
    disconnectSolana,
    network,
    solanaInfo,
  ]);

  const value = useMemo(
    () => ({
      wallets,
      connectedChain: publicKey
        ? {
            id: SolanaChainsMap.get(network)!,
            namespace: ChainNamespace.solana,
          }
        : null,
      connect,
      wallet,
      disconnect: disconnectWallet,
      isConnected: !!publicKey,
    }),
    [wallets, publicKey, wallet, network],
  );

  return (
    <SolanaWalletContext.Provider value={value}>
      {children}
    </SolanaWalletContext.Provider>
  );
};

export function useSolanaWallet() {
  const context = useContext(SolanaWalletContext);
  if (!context) {
    throw new Error(
      "useSolanaWallet must be used within a SolanaWalletProvider",
    );
  }
  return context;
}
