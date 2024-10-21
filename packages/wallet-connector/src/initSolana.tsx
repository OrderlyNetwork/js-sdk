import React, {useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import {WalletAdapterNetwork} from "@solana/wallet-adapter-base";
import {
  WalletModalProvider
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { GlowWalletAdapter } from "@solana/wallet-adapter-glow";

import "@solana/wallet-adapter-react-ui/styles.css";
import {SolanaInitialProps} from "./types";



export default function InitSolana({ children, ...props }:SolanaInitialProps) {
  const network =props.network ?? WalletAdapterNetwork.Devnet;
  const endPoint = useMemo(() => {
    return props.endPoint ?? clusterApiUrl(network)
  }, [network]);

  const wallets =  useMemo(() => {

    return props.wallets ?? [
    ];
  }, []);

  return (
    <ConnectionProvider endpoint={endPoint}>
      <WalletProvider wallets={wallets}>
        <WalletModalProvider>

          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
