import type { PropsWithChildren } from "react";
import { Adapter, WalletAdapterNetwork, WalletError } from "@solana/wallet-adapter-base";

export type SolanaInitialProps = PropsWithChildren<{
  network?: WalletAdapterNetwork;
  endPoint?: string;
  mainnetRpc?: string;
  devnetRpc?: string;
  wallets?: Adapter[];
  // wallet not ready error handle
  onError?: (error: WalletError, adapter?: Adapter) => void;
}>;

export interface ConnectProps {
  walletType: 'EVM' | 'SOL' | 'privy';
  extraType?: string;
}

export const SolanaChains = new Map([[WalletAdapterNetwork.Devnet, 901901901], [WalletAdapterNetwork.Mainnet, 900900900]]);