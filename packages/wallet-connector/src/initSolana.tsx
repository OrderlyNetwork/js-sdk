'use client'
import React, { type PropsWithChildren, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  CoinbaseWalletAdapter,
  SolflareWalletAdapter, PhantomWalletAdapter
} from "@solana/wallet-adapter-wallets";
import {
  WalletModalProvider
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { GlowWalletAdapter } from "@solana/wallet-adapter-glow";

import "@solana/wallet-adapter-react-ui/styles.css";

export default function InitSolana({ children }: PropsWithChildren) {
  const network = WalletAdapterNetwork.Devnet;
  const endPoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(() => {
    return [
      // new WalletConnectWalletAdapter(),
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new GlowWalletAdapter(),
      new CoinbaseWalletAdapter()
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
