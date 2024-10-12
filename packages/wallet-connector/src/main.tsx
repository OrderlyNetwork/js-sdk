import React, { useEffect, type PropsWithChildren, useMemo } from "react";
import { WalletConnectorContext } from "@orderly.network/hooks";
import { WalletDisconnectButton, WalletMultiButton, useWalletModal} from "@solana/wallet-adapter-react-ui";
import {useWallet } from "@solana/wallet-adapter-react";
import { ChainNamespace } from "@orderly.network/core";

export function Main(props: PropsWithChildren) {
  const { setVisible, visible } = useWalletModal();
  const {
    connect: connectSolanaWallet,
    wallet: selectedSolanaWallet,
    connecting : solanaConnecting,
    disconnect: solanaDisconnect,
    signMessage,
    publicKey,
  } = useWallet();

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
    solanaDisconnect();
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
      },
      accounts:[{
        address: publicKey.toBase58(),
      }],
      chains: [
        {
          id: 902902902,
          namespace: ChainNamespace.solana,
        }
      ]
    }


  }, [publicKey]);
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
          id: 902902902,
          namespace: ChainNamespace.solana,
        }

      }}
    >
      <div suppressHydrationWarning>

        <WalletMultiButton />
        <WalletDisconnectButton />
      </div>
        {props.children}
    </WalletConnectorContext.Provider>
);
}