import React, { PropsWithChildren, useMemo } from "react";
import { WalletConnectorContext } from "@orderly.network/hooks";
import { useWallet } from "./useWallet";
import { ConnectDrawer } from "./components/connectDrawer";
import { useWalletConnectorPrivy } from "./provider";

export function Main(props: PropsWithChildren) {
  const { wallet, connectedChain, setChain, namespace } = useWallet();
  const { openConnectDrawer, setOpenConnectDrawer, setTargetNamespace } = useWalletConnectorPrivy();

  const connect = () => {
    setTargetNamespace(undefined);
    return new Promise((resolve, reject) => {
      setOpenConnectDrawer(true);
      resolve([])
    });
  };
  console.log('--xxxmain wallet', wallet);

  const value = useMemo(
    () => ({
      connect,
      disconnect: () => Promise.resolve(),
      connecting: false,
      wallet,
      setChain,
      connectedChain,
      namespace,
      chains: [],
      settingChain: false,
    }),
    [connect, setChain, connectedChain, wallet, namespace]
  );

  return (
    <WalletConnectorContext.Provider value={value}>
      <ConnectDrawer open={openConnectDrawer} onChangeOpen={setOpenConnectDrawer} />
      {props.children}
    </WalletConnectorContext.Provider>
  );
}   