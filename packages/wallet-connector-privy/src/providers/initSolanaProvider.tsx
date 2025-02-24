import React, { PropsWithChildren, useMemo, useState } from "react";
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

interface IProps extends PropsWithChildren {

  solanaConfig: InitSolana;
}

export function InitSolanaProvider(props: IProps) {
  const network = props.solanaConfig.network ?? WalletAdapterNetwork.Devnet;

  const endPoint = useMemo(() => {
    return clusterApiUrl(network);
  }, [network]);

  const [wallets] = useState(() => [new PhantomWalletAdapter()]);
  return (

    <ConnectionProvider endpoint={endPoint}>
      <WalletProvider wallets={wallets} onError={props.solanaConfig.onError}>
        {props.children}
      </WalletProvider>
    </ConnectionProvider>
  );
}
