import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChainNamespace } from "@orderly.network/types";

const SOLChain = 901901901;

export function useSolanaWallet() {
  const [wallet, setWallet] = useState<any>();
  const {
    wallets,
    select,
    connect: connectSolana,
    wallet: walletSolana,
    publicKey,
    signMessage,
    sendTransaction,
    disconnect,
  } = useWallet();
  const { connection} = useConnection();

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

  const isManual = useRef(false);

  const connect = async (walletName: any) => {
    initPromiseRef();
    isManual.current = true;
    if (!solanaPromiseRef.current) {
      return;
    }
    if (!walletSolana) {
      // not select wallet, select wallet first
      select(walletName);
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
        });
      }
    }

    return Promise.all([
      solanaPromiseRef.current.walletSelect,
      solanaPromiseRef.current.connect,
    ])
      .then(
        ([connectedWallet, { userAddress, signMessage, sendTransaction }]) => {
          const tempWallet = {
            label: connectedWallet.adapter.name,
            icon: "",
            provider: {
              signMessage: signMessage,
              connection,
              sendTransaction,
            },
            accounts: [
              {
                address: userAddress,
              },
            ],
            chains: [
              {
                id: SOLChain,
                namespace: ChainNamespace.solana,
              },
            ],
          };
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
      id: SOLChain,
      namespace: ChainNamespace.solana,
    };
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
      // todo add mobile handle logic
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
        signMessage: signMessage,
        connection,
        sendTransaction,
      },
      accounts: [
        {
          address: publicKey.toBase58(),
        },
      ],
      chains: [
        {
          id: SOLChain,
          namespace: ChainNamespace.solana,
        },
      ],
    });
  }, [publicKey, walletSolana, signMessage, sendTransaction, connection]);

  return { wallets, connectedChain, connect, wallet, disconnect };
}
