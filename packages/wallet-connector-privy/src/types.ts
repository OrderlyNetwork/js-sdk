import type { PropsWithChildren } from "react";
import { Adapter, WalletAdapter, WalletAdapterNetwork, WalletError } from "@solana/wallet-adapter-base";
import { Connector } from "wagmi";

export type SolanaInitialProps = PropsWithChildren<{
  network?: WalletAdapterNetwork;
  endPoint?: string;
  mainnetRpc?: string;
  devnetRpc?: string;
  wallets?: Adapter[];
  // wallet not ready error handle
  onError?: (error: WalletError, adapter?: Adapter) => void;
}>;

export enum WalletType {
  EVM = 'EVM',
  SOL = 'SOL',
  PRIVY = 'privy',
}

export interface ConnectProps {
  walletType: WalletType;
  extraType?: string;
  connector?:Connector;
  walletAdapter?: WalletAdapter;
}

export const SolanaChains = new Map([[WalletAdapterNetwork.Devnet, 901901901], [WalletAdapterNetwork.Mainnet, 900900900]]);