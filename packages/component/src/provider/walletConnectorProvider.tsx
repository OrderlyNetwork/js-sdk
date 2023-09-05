import { FC, PropsWithChildren, createContext } from "react";
import { useConnectWallet, useSetChain, useWallets } from "@web3-onboard/react";

export interface WalletConnectorContextState {
  connect: () => Promise<any[]>;
  disconnect: (options: any) => Promise<any[]>;
  connecting: boolean;
  wallet: any;
}

export const WalletConnectorContext =
  createContext<WalletConnectorContextState>({} as WalletConnectorContextState);

export interface WalletConnectorProviderProps {}

export const OnboardConnectorProvider: FC<PropsWithChildren> = (props) => {
  const [
    {
      wallet, // the wallet that has been connected or null if not yet connected
      connecting, // boolean indicating if connection is in progress
    },
    connect, // function to call to initiate user to connect wallet
    disconnect, // function to call with wallet<DisconnectOptions> to disconnect wallet
    updateBalances, // function to be called with an optional array of wallet addresses connected through Onboard to update balance or empty/no params to update all connected wallets
    setWalletModules, // function to be called with an array of wallet modules to conditionally allow connection of wallet types i.e. setWalletModules([ledger, trezor, injected])
    setPrimaryWallet, // function that can set the primary wallet and/or primary account within that wallet. The wallet that is set needs to be passed in for the first parameter and if you would like to set the primary account, the address of that account also needs to be passed in
  ] = useConnectWallet();

  return (
    <WalletConnectorContext.Provider
      value={{ connect, disconnect, connecting, wallet }}
    >
      {props.children}
    </WalletConnectorContext.Provider>
  );
};
