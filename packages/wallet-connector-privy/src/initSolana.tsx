import React, { PropsWithChildren, useMemo, useState } from "react";
import {
  Adapter,
  WalletAdapterNetwork,
  WalletError,
  WalletNotReadyError,
} from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { Wallet } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletProvider } from "@solana/wallet-adapter-react";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { SolanaInitialProps } from "./types";

export function InitSolana(props: SolanaInitialProps) {
  const network = props.network ?? WalletAdapterNetwork.Devnet;

  const endPoint = useMemo(() => {
    return clusterApiUrl(network);
  }, [network]);

  const [wallets] = useState(() => [new PhantomWalletAdapter()]);
  return (
      <ConnectionProvider endpoint={endPoint}>
        <WalletProvider wallets={wallets} onError={props.onError}>
            {props.children}
        </WalletProvider>
      </ConnectionProvider>
  );
}
