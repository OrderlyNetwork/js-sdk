import { createContext, useContext } from "react";
import type { EIP1193Provider } from "@web3-onboard/common";
import { SolanaWalletProvider } from "@kodiak-finance/orderly-default-solana-adapter";
import { ChainNamespace } from "@kodiak-finance/orderly-types";

export type ConnectedChain = {
  id: number | string;
  namespace: ChainNamespace;
};
export type WalletAccount = {
  address: string;
  // ens: Ens | null;
  // uns: Uns | null;
  // balance: Balances | null;
  // secondaryTokens?: SecondaryTokenBalances[] | null;
};
export interface WalletState {
  label: string;
  icon: string;
  provider: EIP1193Provider | SolanaWalletProvider;
  accounts: WalletAccount[];
  chains: ConnectedChain[];
  instance?: unknown;
  additionalInfo?: Record<string, any>;
}

export interface WalletConnectorContextState {
  connect: (options?: any) => Promise<WalletState[]>;
  disconnect: (options: any) => Promise<any[]>;
  connecting: boolean;
  setChain: (options: { chainId: string | number }) => Promise<any>;
  chains: any[];
  // switchChain: (options: { chainId: string }) => Promise<any>;
  wallet: WalletState | null;
  connectedChain: ConnectedChain | null;

  settingChain: boolean;
  namespace: ChainNamespace | null;
}

export const WalletConnectorContext =
  createContext<WalletConnectorContextState>({} as WalletConnectorContextState);

export const useWalletConnector = () => {
  return useContext(WalletConnectorContext);
};
