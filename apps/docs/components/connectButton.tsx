import { useAccount } from "@orderly.network/hooks";
import { useConnectWallet } from "@web3-onboard/react";
import { useEffect } from "react";

export const ConnectButton = () => {
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
  // const { account } = useAccount();

  return (
    <button
      className="bg-gray-700 p-2 text-white rounded hover:bg-gray-800 h-[35px] flex items-center"
      onClick={() => {
        connect().then((res) => {});
      }}
    >
      Connect
    </button>
  );
};
