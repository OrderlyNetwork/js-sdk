import React, { useEffect, useMemo, useRef, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { ChainNamespace } from "@orderly.network/types";
import { WalletState } from "@orderly.network/hooks";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { SolanaChains } from "./config";



export function useSOL({network}: {network: WalletAdapterNetwork}) {
  const [wallet, setWallet] = useState<WalletState| null>(null);
  const { connection } = useConnection();
  const { setVisible: setModalVisible, visible } = useWalletModal();
  const {
    signMessage,
    sendTransaction,
    publicKey,
    wallet: solanaWallet,
    connect: solanaConnect,
    disconnect: solanaDisconnect,
    connecting,
  } = useWallet();


  // 1 for open, 2 for close, null for default
  const selectModalVisibleRef = useRef<boolean>(false);

  const [connected, setConnected] = useState(false);

  const isManual = useRef(false);
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
    console.log("-- init solana promise");
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

  const connect = async () => {
    initPromiseRef();
    isManual.current = true;
    if (!solanaPromiseRef.current) {
      return;
    }
    if (!solanaWallet) {
      setModalVisible(true);
      selectModalVisibleRef.current = true;
    } else {
      solanaPromiseRef.current.walletSelectResolve(solanaWallet);
      if (!publicKey) {
        try {
          await solanaConnect();
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

    console.log("-- connect fn", solanaWallet, publicKey);
    return Promise.all([
      solanaPromiseRef.current.walletSelect,
      solanaPromiseRef.current.connect,
    ])
      .then(([wallet, {userAddress, signMessage, sendTransaction}]) => {
        // console.log('-- connect sol res',{
        //   wallet,
        //   userAddress, signMessage, sendTransaction
        // });
        const tempWallet = {

          label:wallet.adapter.name,
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
              id: SolanaChains.get(network)!,
              namespace: ChainNamespace.solana,
            },
          ],
        }
        setWallet(tempWallet)
        setConnected(true);
        return [tempWallet];

      })
      .catch((e) => {
        console.log("connect solana error", e);
        return Promise.reject(e);
      })
      .finally(() => {
        isManual.current = false;
      });
  };

  const disconnect = async () => {
    console.log('--- discconnect sol');
    await solanaDisconnect();
    setWallet(null)
    setConnected(false);
    return [];
  }

  const connectedChain = useMemo(() => {
    if (!publicKey) {
      return null;
    }
    return {
      id: 901901901,
      namespace: ChainNamespace.solana,
    }


  }, [publicKey]);



  
  useEffect(() => {

    if (selectModalVisibleRef.current) {
      if (
        !visible &&
        !solanaWallet&&
        solanaPromiseRef.current
      ) {
        console.log('-- select modal visible ref', selectModalVisibleRef.current);
        console.log("-- use reject solana select modal");
        solanaPromiseRef.current.walletSelectReject('user reject');
        selectModalVisibleRef.current =false;
      } else if (solanaWallet) {
        selectModalVisibleRef.current = false;
      }
    }

  }, [visible,solanaWallet, solanaPromiseRef.current, selectModalVisibleRef.current])


  useEffect(() => {
    if (!solanaWallet || !publicKey) {
      console.log('--- not connect sol', solanaWallet, publicKey);
      setConnected(false);
      return;
    }
    console.log("-- publick",{
      publicKey: publicKey.toBase58(),
      isManual: isManual.current,

    });


    if (isManual.current) {
      if (solanaPromiseRef.current) {
        solanaPromiseRef.current.connectResolve({
          userAddress: publicKey?.toBase58(),
          signMessage,
          sendTransaction,
        });
      }
      return;
    }
    console.log("-- tt");
    setWallet({
      label: solanaWallet.adapter.name,
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
          id: SolanaChains.get(network)!,
          namespace: ChainNamespace.solana,
        },
      ],
    });
    setConnected(true);
  }, [publicKey, solanaWallet, signMessage, isManual, connection, sendTransaction, network]);

  useEffect(() => {
    if (!publicKey) {
     return;
    }
    const id = connection.onAccountChange(publicKey, (updatedAccountInfo, context) => {
      console.log('--- account change', updatedAccountInfo, context);

    }, {commitment: 'confirmed'})

    return () => {
      if (id) {

        connection.removeAccountChangeListener(id).then();
      }

    }

  }, [connection, publicKey])

  useEffect(() => {
    if (!solanaWallet) {
      return;
    }
    console.log("-- connect", solanaWallet);

    if (solanaPromiseRef.current) {
      solanaPromiseRef.current.walletSelectResolve(solanaWallet);
    }

    solanaConnect()
      .then((res) => {
        console.log("-- connect res", res);
      })
      .catch((e) => {
        solanaPromiseRef.current.connectReject(e);
      });
  }, [solanaWallet, solanaConnect]);


  return {
    connected,
    connect,
    disconnect,
    connecting,
    wallet,
    connectedChain,
  };
}