import type { PropsWithChildren } from "react";
import { Adapter, WalletAdapter, WalletAdapterNetwork, WalletError } from "@solana/wallet-adapter-base";
import { Connector, CreateConnectorFn, Storage } from "wagmi";
import { PrivyClientConfig } from "@privy-io/react-auth";
export type SolanaInitialProps = PropsWithChildren<{
  network?: WalletAdapterNetwork;
  endPoint?: string;
  mainnetRpc?: string;
  devnetRpc?: string;
  wallets?: Adapter[];
  // wallet not ready error handle
  onError?: (error: WalletError, adapter?: Adapter) => void;
}>;

export enum Network {
  mainnet = 'mainnet',
  testnet = 'testnet',
}


export enum WalletType {
  EVM = 'EVM',
  SOL = 'SOL',
  PRIVY = 'privy',
  // abstract wallet
  ABS = 'ABS',
}

export interface ConnectProps {
  walletType: WalletType;
  extraType?: string;
  connector?: Connector;
  walletAdapter?: WalletAdapter;
}

export interface InitPrivy {
  appid: string;
  config?: {
    appearance: Omit<PrivyClientConfig['appearance'], 'walletChainType' | 'walletList'>;
    loginMethods?: PrivyClientConfig['loginMethods'];
  };
}

export interface InitWagmi {
  connectors?: CreateConnectorFn[];
  storage?: Storage;
}

export interface InitSolana {
  mainnetRpc?: string;
  devnetRpc?: string;
  wallets: Adapter[];
  onError: (error: WalletError, adapter?: Adapter) => void;
}

export const SolanaChains = new Map([[WalletAdapterNetwork.Devnet, 901901901], [WalletAdapterNetwork.Mainnet, 900900900]]);

export const SolanaChainsMap = new Map<Network | WalletAdapterNetwork, number>([
  [WalletAdapterNetwork.Devnet, 901901901],
  [Network.testnet, 901901901],
  [Network.mainnet, 900900900],
  [WalletAdapterNetwork.Mainnet, 900900900],
]);



export interface ConnectorWalletType {
  disableWagmi?: boolean;
  disablePrivy?: boolean;
  disableSolana?: boolean;
}
export enum WalletChainTypeEnum {
  onlyEVM = 'onlyEVM',
  onlySOL = 'onlySOL',
  EVM_SOL = 'EVM_SOL',
}
export type WalletChainType = WalletChainTypeEnum;
