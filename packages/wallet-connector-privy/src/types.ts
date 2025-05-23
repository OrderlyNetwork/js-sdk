import type { PropsWithChildren } from "react";
import { PrivyClientConfig } from "@privy-io/react-auth";
import {
  Adapter,
  WalletAdapter,
  WalletAdapterNetwork,
  WalletError,
} from "@solana/wallet-adapter-base";
import { QueryClient } from "@tanstack/react-query";
import { Connector, CreateConnectorFn, Storage } from "wagmi";
import { WalletState } from "@orderly.network/hooks";
import { ChainNamespace } from "@orderly.network/types";

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
  mainnet = "mainnet",
  testnet = "testnet",
}

export enum WalletType {
  EVM = "EVM",
  SOL = "SOL",
  ABSTRACT = "Abstract",
}

export enum WalletConnectType {
  EVM = "EVM",
  SOL = "SOL",
  PRIVY = "privy",
  ABSTRACT = "Abstract",
}

export interface ConnectProps {
  walletType: WalletConnectType;
  extraType?: string;
  connector?: Connector;
  walletAdapter?: WalletAdapter;
}

export interface InitPrivy {
  appid: string;
  config?: {
    appearance: Omit<
      PrivyClientConfig["appearance"],
      "walletChainType" | "walletList"
    >;
    loginMethods?: PrivyClientConfig["loginMethods"];
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

export interface InitAbstract {
  queryClient?: QueryClient;
}

export const SolanaChains = new Map([
  [WalletAdapterNetwork.Devnet, 901901901],
  [WalletAdapterNetwork.Mainnet, 900900900],
]);

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
  disableAGW?: boolean;
}
export interface WalletChainTypeConfig {
  hasEvm: boolean;
  hasSol: boolean;
  hasAbstract: boolean;
}
export enum WalletChainTypeEnum {
  onlyEVM = "onlyEVM",
  onlySOL = "onlySOL",
  EVM_SOL = "EVM_SOL",
}
export type WalletChainType = WalletChainTypeEnum;

export type IWalletState = WalletState & {
  chain?: {
    namespace: ChainNamespace;
    id: number;
  };
};
