import React, { useEffect, type PropsWithChildren, useMemo } from "react";
import { WalletConnectorContext } from "@orderly.network/hooks";
import { useWalletModal} from "@solana/wallet-adapter-react-ui";
import {useConnection, useWallet} from "@solana/wallet-adapter-react";
import { ChainNamespace } from "@orderly.network/core";
import {clusterApiUrl, Connection} from "@solana/web3.js";

export function Main(props: PropsWithChildren) {
  const { setVisible, visible } = useWalletModal();
  const {
    connect: connectSolanaWallet,
    wallet: selectedSolanaWallet,
    connecting : solanaConnecting,
    disconnect: solanaDisconnect,
    signMessage,
      sendTransaction,
    publicKey,
  } = useWallet();
  const {connection} = useConnection();

  const connect = async () => {
    console.log('-- connect solana');
    if (!selectedSolanaWallet) {
      setVisible(true)
    }
    connectSolanaWallet().then(res => {
      console.log('-- publickey', publicKey);
      console.log('-- publick', publicKey?.toBase58());

      console.log('-- res', res);
    }).catch((err) => {
      console.log('-- error',err);
    })
    return [];
  };

  const disconnect = async () => {
    await solanaDisconnect();
    return []
  }

  useEffect(() => {
    if (!selectedSolanaWallet) return;
    if (visible) return;
    console.log('-- selectedSolanaWallet', selectedSolanaWallet, visible);

    connectSolanaWallet().then(res => {
      console.log('-- publick', publicKey?.toBase58());
      console.log('-- res', res);
    }).catch((err) => {
      console.log('-- error',err);
    })

  }, [selectedSolanaWallet, visible]);

  const connecting = false;
  const wallet = useMemo(() => {
    console.log('-- publiKey', publicKey);

    if (!publicKey) {
     return null;
    }
    return {
      label:'',
      icon: '',
      provider: {
        signMessage: signMessage,
        connection,
        sendTransaction,
      },
      accounts:[{
        address: publicKey.toBase58(),
      }],
      chains: [
        {
          id: 901901901,
          namespace: ChainNamespace.solana,
        }
      ]
    }


  }, [publicKey, signMessage, connection]);
  const setChanin = () => {}

  return (
    <WalletConnectorContext.Provider
      value={{
        connect,
        disconnect,
        connecting,
        wallet,
        setChanin,
        connectedChain: {
          id: 901901901,
          namespace: ChainNamespace.solana,
        }

      }}
    >
        {props.children}
    </WalletConnectorContext.Provider>
);
}