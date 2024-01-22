import { createContext, useContext } from "react";

export type ConnectedChain = {
  id: number;
};
export interface WalletConnectorContextState {
  connect: () => Promise<any[]>;
  disconnect: (options: any) => Promise<any[]>;
  connecting: boolean;
  setChain: (options: any) => Promise<any>;
  chains: any[];
  // switchChain: (options: { chainId: string }) => Promise<any>;
  wallet: any;
  connectedChain: ConnectedChain | null;

  settingChain: boolean;
}

export const WalletConnectorContext =
  createContext<WalletConnectorContextState>({} as WalletConnectorContextState);

export const useWalletConnector = () => {
  return useContext(WalletConnectorContext);
};
