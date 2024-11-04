import type { PropsWithChildren } from "react";
import { Adapter, WalletAdapterNetwork, WalletError } from "@solana/wallet-adapter-base";

export type SolanaInitialProps = PropsWithChildren<{
  network?: WalletAdapterNetwork;
  endPoint?: string;
  wallets?: Adapter[];
  // wallet not ready error handle
  onError?: (error: WalletError, adapter?: Adapter)=> void;
}>;

export type EvmInitialProps = PropsWithChildren<{
  apiKey?: string;
  // options?: ConnectorInitOptions;
  // skip board configuration if already initialized
  skipInit?: boolean;
}>;
