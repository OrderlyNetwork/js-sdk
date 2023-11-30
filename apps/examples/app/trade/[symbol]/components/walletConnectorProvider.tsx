import { WalletConnectorContext } from "@orderly.network/react";
import { useConnectWallet, useSetChain } from "@web3-onboard/react";
import { FC, PropsWithChildren } from "react";

export const WalletConnectorProvider: FC<PropsWithChildren> = (props) => {
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

  const [
    {
      chains, // the list of chains that web3-onboard was initialized with
      connectedChain, // the current chain the user's wallet is connected to
      settingChain, // boolean indicating if the chain is in the process of being set
    },
    setChain, // function to call to initiate user to switch chains in their wallet
  ] = useSetChain();
  return (
    <WalletConnectorContext.Provider
      value={{
        connect,
        disconnect,
        connecting,
        wallet,
        setChain,
        chains,
        connectedChain,
        settingChain,
      }}
    >
      {props.children}
    </WalletConnectorContext.Provider>
  );
};
