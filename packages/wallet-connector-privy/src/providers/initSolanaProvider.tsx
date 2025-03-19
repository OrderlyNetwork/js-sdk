import React, { PropsWithChildren, useEffect, useMemo, useState } from "react";
import {
  Adapter,
  WalletAdapterNetwork,
  WalletError,
  WalletNotReadyError,
} from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletProvider } from "@solana/wallet-adapter-react";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { InitSolana } from "../types";
import { useWalletConnectorPrivy } from "../provider";

interface IProps extends PropsWithChildren<InitSolana> {}

export function InitSolanaProvider({mainnetRpc, devnetRpc, wallets: walletsProp, onError, children}: IProps) {
  const {network, setSolanaInfo} = useWalletConnectorPrivy();

  const wallets = useMemo(() => {
    return walletsProp ?? [new PhantomWalletAdapter()];
  }, [walletsProp]);

  useEffect(() => {
    let rpcUrl = null;
    if (network === 'mainnet') {
      rpcUrl = mainnetRpc ?? null;
    } else {
      rpcUrl = devnetRpc ?? null;
    }
    if (rpcUrl) {
      setSolanaInfo({
        rpcUrl: rpcUrl,
        network: network === 'mainnet' ? WalletAdapterNetwork.Mainnet : WalletAdapterNetwork.Devnet,
      });
    }
  }, [network, mainnetRpc, devnetRpc, setSolanaInfo]);
  return (

      <WalletProvider wallets={wallets} onError={onError}>
        {children}
      </WalletProvider>
  );
}
