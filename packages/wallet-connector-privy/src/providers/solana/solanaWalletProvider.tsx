import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChainNamespace } from "@orderly.network/types";
import { WalletAdapterNetwork, WalletName } from "@solana/wallet-adapter-base";
import { useWalletConnectorPrivy } from "../../provider";
import { SolanaChainsMap } from "../../types";
import { useStorageLedgerAddress } from "@orderly.network/hooks";

interface SolanaWalletContextValue {
  wallets: any[];
  connectedChain: { id: number; namespace: ChainNamespace } | null;
  connect: (walletName: string) => Promise<any>;
  wallet: any;
  disconnect: () => void;
  isConnected: boolean;
}

const SolanaWalletContext = createContext<SolanaWalletContextValue | null>(
  null
);

export const SolanaWalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { setLedgerAddress } = useStorageLedgerAddress();
  const [wallet, setWallet] = useState<any>();
  const { network, solanaInfo, connectorWalletType } = useWalletConnectorPrivy();
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
  } = connectorWalletType.disableSolana ? {
    wallets: [],
    select: () => Promise.resolve(),
    connect: () => Promise.resolve(),
    wallet: null,
    publicKey: null,
    signMessage: () => Promise.resolve(),
    signTransaction: () => Promise.resolve(),
    sendTransaction: () => Promise.resolve(),
    disconnect: () => Promise.resolve(),
  } : useWallet();

  const solanaPromiseRef = useRef<{
    walletSelect: Promise<any> | null;
    connect: Promise<any> | null;
    walletSelectResolve: (value: any) => void;
    walletSelectReject: (value: any) => void;
    connectResolve: (value: any) => void;
    connectReject: (value: any) => void;
  }>({
    walletSelect: null,
    connect: null,
    walletSelectResolve: () => {},
    walletSelectReject: () => {},
    connectReject: () => {},
    connectResolve: () => {},
  });

  const isManual = useRef(false);

  const initPromiseRef = () => {
    solanaPromiseRef.current.walletSelectResolve = () => {};
    solanaPromiseRef.current.walletSelectReject = () => {};
    solanaPromiseRef.current.connectReject = () => {};
    solanaPromiseRef.current.connectReject = () => {};
    solanaPromiseRef.current.connect = null;
    solanaPromiseRef.current.walletSelect = null;
    solanaPromiseRef.current.walletSelect = new Promise((resolve, reject) => {
      solanaPromiseRef.current.walletSelectResolve = resolve;
      solanaPromiseRef.current.walletSelectReject = reject;
    });
    solanaPromiseRef.current.connect = new Promise((resolve, reject) => {
      solanaPromiseRef.current.connectResolve = resolve;
      solanaPromiseRef.current.connectReject = reject;
    });
  };

  const disconnect = () => {
    disconnectSolana().then(() => {
      setWallet(undefined);
    });
  };

  const connect = async (walletName: string) => {
    initPromiseRef();
    isManual.current = true;
    if (!solanaPromiseRef.current) {
      return;
    }
    if (!walletSolana) {
      select(walletName as WalletName);
    } else {
      solanaPromiseRef.current.walletSelectResolve(walletSolana);
      if (!publicKey) {
        try {
          await connectSolana();
        } catch (e) {
          solanaPromiseRef.current.connectReject(e);
        }
      } else {
        solanaPromiseRef.current.connectResolve({
          userAddress: publicKey.toBase58(),
          signMessage,
          sendTransaction,
          signTransaction,
        });
      }
    }

    return Promise.all([
      solanaPromiseRef.current.walletSelect,
      solanaPromiseRef.current.connect,
    ])
      .then(
        ([
          connectedWallet,
          { userAddress, signMessage, signTransaction, sendTransaction },
        ]) => {
          const tempWallet = {
            label: connectedWallet.adapter.name,
            icon: "",
            provider: {
              rpcUrl: solanaInfo?.rpcUrl ?? null,
              network: solanaInfo?.network ?? WalletAdapterNetwork.Devnet,
              signMessage: signMessage,
              signTransaction: signTransaction,
              sendTransaction,
            },
            accounts: [
              {
                address: userAddress,
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
          if (connectedWallet.adapter.name === "Ledger") {
            setLedgerAddress(userAddress);
          }
          isManual.current = false;
          setWallet(tempWallet);
        }
      )
      .catch((e) => {
        console.error("connect solana wallet error", e);
        return Promise.reject(e);
      });
  };

  const connectedChain = useMemo(() => {
    if (!publicKey) {
      return null;
    }
    return {
      id: SolanaChainsMap.get(network)!,
      namespace: ChainNamespace.solana,
    };
  }, [publicKey]);

  const isConnected = useMemo(() => {
    return !!publicKey;
  }, [publicKey]);

  useEffect(() => {
    if (!walletSolana) {
      return;
    }
    if (isManual.current && solanaPromiseRef.current) {
      solanaPromiseRef.current.walletSelectResolve(walletSolana);
      connectSolana().then();
    }
    if (!publicKey) {
      connectSolana().then();
      return;
    }
    if (isManual.current && solanaPromiseRef.current) {
      solanaPromiseRef.current.connectResolve({
        userAddress: publicKey?.toBase58(),
        signMessage,
        sendTransaction,
      });
      return;
    }
    setWallet({
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
    });
  }, [
    publicKey,
    walletSolana,
    signMessage,
    signTransaction,
    sendTransaction,
    solanaInfo,
  ]);

  const value = useMemo(
    () => ({
      wallets,
      connectedChain,
      connect,
      wallet,
      disconnect,
      isConnected,
    }),
    [wallets, connectedChain, wallet, isConnected]
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
      "useSolanaWallet must be used within a SolanaWalletProvider"
    );
  }
  return context;
}
