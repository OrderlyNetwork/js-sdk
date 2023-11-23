import { useAccount } from "@orderly.network/hooks";
import { FC, PropsWithChildren, useEffect } from "react";

export const DocProvider: FC<PropsWithChildren> = ({ children }) => {
  const [
    {
      wallet, // the wallet that has been connected or null if not yet connected
      connecting, // boolean indicating if connection is in progress
    },
    connect, // function to call to initiate user to connect wallet
    disconnect, // function to call with wallet<DisconnectOptions> to disconnect wallet
    // function that can set the primary wallet and/or primary account within that wallet. The wallet that is set needs to be passed in for the first parameter and if you would like to set the primary account, the address of that account also needs to be passed in
  ] = useConnectWallet();

  const { account } = useAccount();

  useEffect(() => {
    if (wallet && wallet.accounts && wallet.accounts.length > 0) {
      account.setAddress(wallet.accounts[0].address, {
        chain: wallet.chains[0],
        provider: wallet.provider,
      });
    }
  }, [wallet]);

  return <>{children}</>;
};
