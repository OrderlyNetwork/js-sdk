import React, { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { Adapter, WalletAdapterNetwork, WalletError, WalletNotReadyError } from "@solana/wallet-adapter-base";
import {
  WalletModalProvider
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";
import { SolanaInitialProps } from "./types";
import {
  createDefaultAddressSelector,
  createDefaultAuthorizationResultCache, createDefaultWalletNotFoundHandler,
  SolanaMobileWalletAdapter
} from "@solana-mobile/wallet-adapter-mobile";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { getGlobalObject } from "@orderly.network/utils";
import { useScreen } from "@orderly.network/ui";

export default function InitSolana({ children, ...props }: SolanaInitialProps) {
  const { isMobile } = useScreen();
  const network = props.network ?? WalletAdapterNetwork.Devnet;

  const endPoint = useMemo(() => {
    if (network === WalletAdapterNetwork.Mainnet) {
      // return 'https://rpc.ankr.com/solana';
      return props.mainnetRpc ?? clusterApiUrl(network);
      // return 'https://svc.blockdaemon.com/solana/mainnet/native?apiKey=zpka_417399a60de542759adf31a42a30e60e_61763d0a'
    }
    if (network === WalletAdapterNetwork.Devnet) {
      return props.devnetRpc ?? clusterApiUrl(network);
    }
    return clusterApiUrl(network);
  }, [network, props.mainnetRpc, props.devnetRpc]);

  const mobileWalletNotFoundHanlder = (adapter: SolanaMobileWalletAdapter) => {
    console.log('-- mobile wallet adapter', adapter);

    return Promise.reject(new WalletNotReadyError('wallet not ready'));
  }


  const handleSolanaError = (error: WalletError, adapter?: Adapter) => {
    console.log('-- solanan error', error);
    console.log('-- solana adapter', adapter);

    if (!isMobile) {
      window.open(adapter?.url, '_blank');
    }
  }

  const wallets = useMemo(() => {
    let uri = '';
    if (typeof window !== "undefined") {
      const location = (getGlobalObject() as any).location;
      uri = `${location.protocol}//${location.host}`;
    }



    return props.wallets ?? [
      new PhantomWalletAdapter(),
      new SolanaMobileWalletAdapter({
        addressSelector: createDefaultAddressSelector(),
        appIdentity: {
          uri,
        },
        authorizationResultCache: createDefaultAuthorizationResultCache(),
        chain: network,
        onWalletNotFound: mobileWalletNotFoundHanlder,
      })
    ];
  }, [props.wallets, network]);

  return (
    <ConnectionProvider endpoint={endPoint}>
      <WalletProvider wallets={wallets} onError={props.onError ?? handleSolanaError}>
        <WalletModalProvider className='oui-pointer-events-auto'>

          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
