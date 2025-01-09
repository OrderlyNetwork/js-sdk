import type { PropsWithChildren } from "react";
import { Adapter, WalletAdapterNetwork, WalletError } from "@solana/wallet-adapter-base";

export type SolanaInitialProps = PropsWithChildren<{
    network?: WalletAdapterNetwork;
    endPoint?: string;
    mainnetRpc?: string;
    devnetRpc?: string;
    wallets?: Adapter[];
    // wallet not ready error handle
    onError?: (error: WalletError, adapter?: Adapter)=> void;
  }>;