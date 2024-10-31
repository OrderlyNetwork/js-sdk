import type { PropsWithChildren } from "react";
import { Adapter, WalletAdapterNetwork } from "@solana/wallet-adapter-base";

export type SolanaInitialProps = PropsWithChildren<{
  network?: WalletAdapterNetwork;
  endPoint?: string;
  wallets?: Adapter[];
}>;

export type EvmInitialProps = PropsWithChildren<{
  apiKey?: string;
  // options?: ConnectorInitOptions;
  // skip board configuration if already initialized
  skipInit?: boolean;
}>;
