import type { PropsWithChildren } from "react";
import {
  Adapter,
  WalletAdapterNetwork,
  WalletError,
} from "@solana/wallet-adapter-base";
import type { InitOptions } from "@web3-onboard/core";
import { Optional } from "@orderly.network/types";

export type ConnectorInitOptions = Optional<
  InitOptions,
  | "apiKey"
  | "connect"
  | "wallets"
  | "chains"
  | "appMetadata"
  | "accountCenter"
  | "theme"
>;
export type SolanaInitialProps = PropsWithChildren<{
  network?: WalletAdapterNetwork;
  mainnetRpc?: string;
  devnetRpc?: string;
  wallets?: Adapter[];
  // wallet not ready error handle
  onError?: (error: WalletError, adapter?: Adapter) => void;
}>;

export type EvmInitialProps = PropsWithChildren<{
  apiKey?: string;
  options?: ConnectorInitOptions;
  /**
   * Skip board configuration if already initialized.
   * Onboard instances initialized outside this provider do not select the
   * requested network for Binance Wallet on the first connection.
   */
  skipInit?: boolean;
}>;
